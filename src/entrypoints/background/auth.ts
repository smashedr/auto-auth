import { getOptions, getSession } from '@/utils/options.ts'

const pendingRequests: string[] = []

export function onAuthRequired(
  details: chrome.webRequest.OnAuthRequiredDetails,
  asyncCallback?: (response: chrome.webRequest.BlockingResponse) => void,
): chrome.webRequest.BlockingResponse | undefined {
  processRequest(details, asyncCallback).catch(console.warn)
  return // NOSONAR
}

export function webRequestFinished(
  requestDetails:
    | chrome.webRequest.OnCompletedDetails
    | chrome.webRequest.OnErrorOccurredDetails,
): void {
  let index = pendingRequests.indexOf(requestDetails.requestId)
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
  console.debug('onAuthRequired:', details)

  const options = await getOptions()
  if (options.tempDisabled) {
    console.log('%cExtension is Temporarily Disabled!', 'color: Red')
    asyncCallback({})
    return
  }
  if (options.ignoreProxy && details.statusCode === 407) {
    console.log('%cIgnoring Proxy Authentication!', 'color: Yellow')
    asyncCallback({})
    return
  }
  const url = new URL(details.url)
  // console.debug('url.host:', url.host)

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
    asyncCallback({ cancel: true })
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
      asyncCallback({})
      return
    }
    console.log(`%cSending Saved Creds for: ${details.requestId}`, 'color: LimeGreen')
    const [username, password] = creds.split(':')
    const authCredentials: chrome.webRequest.AuthCredentials = { username, password }
    // console.debug('authCredentials:', authCredentials)
    asyncCallback({ authCredentials })
    return
  }

  // Check for Temporary Credentials
  const session = await getSession()
  console.log('session:', session)

  if (url.host in session) {
    console.log(`%cSending Session Creds for: ${details.requestId}`, 'color: SpringGreen')
    const [username, password] = session[url.host].split(':')
    const authCredentials: chrome.webRequest.AuthCredentials = { username, password }
    // console.debug('authCredentials:', authCredentials)
    asyncCallback({ authCredentials })
    return
  }

  // New Request Without Credentials
  console.log(
    `%cNo Credentials for Request ID: ${details.requestId}`,
    'color: DeepSkyBlue',
  )
  hijackRequest()
}
