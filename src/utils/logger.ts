export const debug = import.meta.env.DEV ? console.log.bind(console) : () => {}
