# TODO

- :robot:

## Bugs

- Relocate `submitHost` in [index.ts](src/utils/index.ts)
- Confirm `getAppConfig()` usage in top-level of [index.ts](src/entrypoints/background/index.ts)
  - This builds to `r()` at runtime and **should** work without issue...

# Completed

- Editing an ignored host's hostname makes it not ignored
  - Made it unable to edit ignored host by clicking
