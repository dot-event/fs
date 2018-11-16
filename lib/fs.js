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
  const { events } = options

  if (events.ops.has("fs")) {
    return options
  }

  events.onAny({
    fs: async options => {
      for (const option of Object.keys(options)) {
        if (actions[option]) {
          await actions[option](options)
        }
      }
    },
  })

  return options
}

export const actions = {
  copy: async ({ dest, event, options, src, store }) => {
    const json = await copy(src, dest, options)
    await store.set(event.props, json)
  },

  ensureSymlink: async ({
    dest,
    event,
    src,
    store,
    type,
  }) => {
    await ensureSymlink(src, dest, type)
    await store.set(event.props, { success: true })
  },

  pathExists: async ({ event, path, store }) => {
    await store.set(event.props, {
      exists: await pathExists(path),
    })
  },

  readJson: async ({
    ensure,
    event,
    events,
    json,
    path,
    options,
    store,
  }) => {
    try {
      json = await readJson(path, options)
    } catch (e) {
      await events.fs(event.props, {
        ensure,
        json,
        path,
      })
    }

    await store.set(event.props, json)
  },

  remove: async ({ event, path, store }) => {
    await remove(path)
    await store.set(event.props, { success: true })
  },

  writeJson: async ({
    ensure,
    event,
    json,
    options,
    path,
    store,
  }) => {
    if (ensure) {
      await ensureFile(path)
    }

    await writeJson(path, json, options)
    await store.set(event.props, { success: true })
  },
}
