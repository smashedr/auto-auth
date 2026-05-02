# TODO

## Bugs

- :robot:

# Completed

- Confirm `getAppConfig()` usage in top-level of [index.ts](src/entrypoints/background/index.ts)
  - This builds to `r()` for runtime and **should** work without issue...
- Editing an ignored host's hostname makes it not ignored
  - Made it unable to edit ignored host by clicking
- Relocate `submitHost` in [index.ts](src/utils/index.ts)
  - This can live here for now, the file is still empty...
