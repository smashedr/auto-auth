// export const debug = import.meta.env.DEV ? console.log.bind(console) : () => {}

// NOTE: To prepend [debug] and preserver formatting the 1st argument must be a string
export const debug = import.meta.env.DEV
  ? (first: string, ...rest: any) => console.log('[debug] ' + first, ...rest)
  : () => {}
