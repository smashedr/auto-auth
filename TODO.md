# TODO

## Bugs

### Blocking

- :robot:

### Existing

- Not possible to ignore a host without being at the login page

### Needs Investigation

- Check all `TODO: Logging`
- Cleanup Logging in [App.vue](src/entrypoints/auth/App.vue)
- Cleanup Logging in [auth.ts](src/entrypoints/background/auth.ts)
- Implement or Delete [HostsOffscreen.vue](src/components/HostsOffscreen.vue)

## Translations

- [x] English `en`
- [x] Korean `ko` - 한국어
- [x] Japanese `ja` - 日本語
- [x] Russian `ru` - Русский
- [x] Chinese (China) `zh_CN` - 中文（简体）
- [x] German `de` - Deutsch
- [x] French `fr` - Français
- [x] Spanish `es` - Español
- [x] Portuguese (Brazil) `pt_BR` - Português (Brasil)
- [x] Portuguese (Portugal) `pt_PT` - Português (Portugal)

## Before Merge

- Mobile Testing
- Highlight New Feature
- Cleanup All `TODO: UPDATE MERGE`
- Update [README.md](README.md)
- Update [wxt.config.ts](wxt.config.ts)
- Update [app.config.ts](src/app.config.ts)
- Update [release.yaml](.github/workflows/release.yaml)

# Completed

- Confirm usage of `watch()` in [App.vue](src/entrypoints/auth/App.vue)
  - This was rolled up into the other watch and executes correctly
- Edit Host Modal does not check if credentials changed when saving
  - Add method to check
- Editing a host to an existing host deletes the existing host silently
  - Add check on the HostModal and HostTable
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
