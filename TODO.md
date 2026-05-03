# TODO

## Bugs

- :robot:

## Needs Investigation

- Confirm usage of `watch()` in [App.vue](src/entrypoints/auth/App.vue)

## Confirmed Items

- Confirm Ignored Host Management is Satisfactory
- Validate All English Translations
- Add Additional Locales

## Before Merge

- Cleanup All **TODO**
- Cleanup All Logging
- Update [README.md](README.md)
- Update [wxt.config.ts](wxt.config.ts)
- Update [app.config.ts](src/app.config.ts)
- Update [release.yaml](.github/workflows/release.yaml)

# Completed

- Confirm `getAppConfig()` usage in top-level of [index.ts](src/entrypoints/background/index.ts)
  - This builds to `r()` for runtime and **should** work without issue...
- Editing an ignored host's hostname makes it not ignored
  - Made it unable to edit ignored host by clicking
- Relocate `submitHost` in [index.ts](src/utils/index.ts)
  - This can live here for now, the file is still empty...
