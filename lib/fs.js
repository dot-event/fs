import {
  copy,
  ensureFile,
  readJson,
  writeJson,
} from "fs-extra"

export default options => {
  const { events, store } = options

  if (events.ops.has("fs")) {
    return options
  }

  events.onAny(
    "fs.copy",
    async ({ dest, event, src, options }) => {
      const props = event.props || []

      const json = await copy(src, dest, options)
      await store.set(["fs", ...props], json)
    }
  )

  events.onAny(
    "fs.readJson",
    async ({ event, path, options }) => {
      const props = event.props || []

      const json = await readJson(path, options)
      await store.set(["fs", ...props], json)
    }
  )

  events.onAny(
    "fs.writeJson",
    async ({ ensure, event, json, path, options }) => {
      const props = event.props || []

      if (ensure) {
        await ensureFile(path)
      }

      await writeJson(path, json, options)
      await store.set(["fs", ...props], { success: true })
    }
  )

  return options
}
