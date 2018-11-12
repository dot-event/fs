import {
  copy,
  ensureFile,
  ensureSymlink,
  pathExists,
  readJson,
  remove,
  writeJson,
} from "fs-extra"

export default options => {
  const { events, store } = options

  if (events.ops.has("fs")) {
    return options
  }

  events.onAny({
    "fs.copy": async ({ dest, event, src, options }) => {
      const props = event.props || []

      const json = await copy(src, dest, options)
      await store.set(["fs", ...props], json)
    },
    "fs.ensureSymlink": async ({
      dest,
      event,
      src,
      type,
    }) => {
      const props = event.props || []

      await ensureSymlink(src, dest, type)
      await store.set(["fs", ...props], { success: true })
    },
    "fs.pathExists": async ({ event, path }) => {
      const props = event.props || []

      await store.set(["fs", ...props], {
        exists: await pathExists(path),
      })
    },
    "fs.readJson": async ({ event, path, options }) => {
      const props = event.props || []

      const json = await readJson(path, options)
      await store.set(["fs", ...props], json)
    },
    "fs.remove": async ({ event, path }) => {
      const props = event.props || []

      await remove(path)
      await store.set(["fs", ...props], { success: true })
    },
    "fs.writeJson": async ({
      ensure,
      event,
      json,
      path,
      options,
    }) => {
      const props = event.props || []

      if (ensure) {
        await ensureFile(path)
      }

      await writeJson(path, json, options)
      await store.set(["fs", ...props], { success: true })
    },
  })

  return options
}
