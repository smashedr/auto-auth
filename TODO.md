# TODO

## Bugs

- Edit Host Modal does not check if credentials changed when saving
- Not possible to ignore a host without being at the login page

## Needs Investigation

- Confirm usage of `watch()` in [App.vue](src/entrypoints/auth/App.vue)
- Cleanup Logging in [auth.ts](src/entrypoints/background/auth.ts)

## Confirmed Items

- Confirm Ignored Host Management is Satisfactory
- Validate All English Translations
- Add Additional Locales

## Before Merge

- Cleanup All **TODO**
- Update [README.md](README.md)
- Update [wxt.config.ts](wxt.config.ts)
- Update [app.config.ts](src/app.config.ts)
- Update [release.yaml](.github/workflows/release.yaml)

# Completed

- Cleanup Logging in [creds.ts](src/utils/creds.ts)
  - Should be good enough
- Cleanup Modal Refs in [HostModal.vue](src/components/HostModal.vue)
  - Both are used, element for event listener and modal for .\_config
- Verify onAuthRequired in [auth.ts](src/entrypoints/background/auth.ts)
  - This works identically to the VanillaJS version
- Add reusable tab update function to [App.vue](src/entrypoints/auth/App.vue)
  - Added`updateTab` function
- Update All Logging
  - Added a logging module with `debug` function [logger.ts](src/utils/logger.ts)
- Confirm `getAppConfig()` usage in top-level of [index.ts](src/entrypoints/background/index.ts)
  - This builds to `r()` for runtime and **should** work without issue...
- Editing an ignored host's hostname makes it not ignored
  - Made it unable to edit ignored host by clicking
- Relocate `submitHost` in [index.ts](src/utils/index.ts)
  - This can live here for now, the file is still empty...
