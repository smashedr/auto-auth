// noinspection JSUnusedGlobalSymbols

declare namespace chrome.scripting {
  interface InjectionResult<T> {
    error?: unknown
  }
}

declare namespace chrome.sidebarAction {
  function open(): void
}
