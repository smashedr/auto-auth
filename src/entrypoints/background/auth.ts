import { parseCreds } from '@/utils/creds.ts'
import { getOptions, getSession } from '@/utils/options.ts'
import { Hosts } from '@/utils/hosts.ts'

// TODO: Logging

const pendingRequests: string[] = []

export function onAuthRequired(
  details: chrome.webRequest.OnAuthRequiredDetails,
  asyncCallback?: (response: chrome.webRequest.BlockingResponse) => void,
): chrome.webRequest.BlockingResponse | undefined {
  processRequest(details, asyncCallback).catch(console.warn)
  return undefined // returned so asyncCallback can be called
}

export function webRequestFinished(
  requestDetails:
    | chrome.webRequest.OnCompletedDetails
    | chrome.webRequest.OnErrorOccurredDetails,
): void {
  const index = pendingRequests.indexOf(requestDetails.requestId)
  if (index > -1) {
    console.debug(
      `%cRemoving pendingRequests: ${requestDetails.requestId}`,
      'color: Khaki',
    )
    pendingRequests.splice(index, 1)
  }
}

async function processRequest(
  details: chrome.webRequest.OnAuthRequiredDetails,
  asyncCallback?: (response: chrome.webRequest.BlockingResponse) => void,
) {
  if (!asyncCallback) throw new Error('onAuthRequired: asyncCallback is required')
  console.log('onAuthRequired:', details)

  const options = await getOptions()
  if (options.tempDisabled) {
    console.log('%cExtension is Temporarily Disabled!', 'color: Red')
    return asyncCallback({})
  }
  if (options.ignoreProxy && details.statusCode === 407) {
    console.log('%cIgnoring Proxy Authentication!', 'color: Yellow')
    return asyncCallback({})
  }
  const url = new URL(details.url)
  // console.log('url.host:', url.host)

  const hijackRequest = (failed = false): void => {
    if (details.tabId === -1) {
      console.warn(`Unable to process tab:`, details)
      return asyncCallback({})
    }
    console.log(
      `Cancel Request and Hijack w/ failed: %c${failed}`,
      `color: ${failed ? 'Yellow' : 'Lime'}`,
    )
    const auth = new URL(chrome.runtime.getURL('auth.html'))
    auth.searchParams.append('url', details.url)
    if (failed) {
      auth.searchParams.append('fail', 'yes')
    }
    chrome.tabs.update(details.tabId, { url: auth.href })
    return asyncCallback({ cancel: true })
  }

  // Check if Request Already Processed
  if (pendingRequests.includes(details.requestId)) {
    console.log(`%cAlready Processed Request ID: ${details.requestId}`, 'color: Orange')
    hijackRequest(true)
  }
  pendingRequests.push(details.requestId)

  const creds = await Hosts.get(url.host)
  // console.log('creds:', creds)

  // Check for Saved Credentials
  if (creds) {
    if (creds === 'ignored') {
      console.log(
        `%cHost is Set to Ignored: %c${url.host}`,
        'color: Yellow',
        'color: Violet',
      )
      return asyncCallback({})
    }
    console.log(`%cSending Saved Creds for: ${details.requestId}`, 'color: LimeGreen')
    const [username, password] = parseCreds(creds)
    const authCredentials: chrome.webRequest.AuthCredentials = { username, password }
    // console.log('authCredentials:', authCredentials)
    return asyncCallback({ authCredentials })
  }

  // Check for Temporary Credentials
  const session = await getSession()
  console.log('session:', session)

  if (url.host in session) {
    console.log(`%cSending Session Creds for: ${details.requestId}`, 'color: SpringGreen')
    const [username, password] = parseCreds(session[url.host])
    const authCredentials: chrome.webRequest.AuthCredentials = { username, password }
    // console.log('authCredentials:', authCredentials)
    return asyncCallback({ authCredentials })
  }

  // New Request Without Credentials
  console.log(
    `%cNo Credentials for Request ID: ${details.requestId}`,
    'color: DeepSkyBlue',
  )
  hijackRequest()
}
