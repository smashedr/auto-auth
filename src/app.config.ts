// https://wxt.dev/guide/essentials/config/runtime.html#environment-variables-in-app-config
// noinspection JSUnusedGlobalSymbols

import { defineAppConfig } from '#imports'

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    githubUrl: string
  }
}

export default defineAppConfig({
  githubUrl: 'https://github.com/smashedr/auto-auth', // TODO: UPDATE BEFORE MERGE
})
