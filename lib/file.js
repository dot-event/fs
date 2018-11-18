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
      const { action } = options

      if (actions[action]) {
        await actions[action](options)
      }
    },
  })

  return options
}

export const actions = {
  copy: async ({ dest, event, options, src }) => {
    event.signal.returnValue = await copy(
      src,
      dest,
      options
    )
  },

  ensureSymlink: async options => {
    const { dest, event, src, type } = options

    event.signal.returnValue = await ensureSymlink(
      src,
      dest,
      type
    )
  },

  pathExists: async ({ event, path }) => {
    event.signal.returnValue = await pathExists(path)
  },

  readJson: async options => {
    const { event, events, json, path } = options
    let out

    try {
      out = await readJson(path)
    } catch (e) {
      await events.fs(event.props, {
        ...event.options,
        action: "writeJson",
      })
    }

    event.signal.returnValue = out || json
  },

  remove: async ({ event, path }) => {
    event.signal.returnValue = await remove(path)
  },

  storePathExists: async ({ event, events, store }) => {
    const exists = await events.fs({
      ...event.options,
      action: "pathExists",
    })

    await store.set(event.props, { exists })

    event.signal.returnValue = exists
  },

  storeReadJson: async options => {
    const { event, events, store } = options

    const json = await events.fs(event.props, {
      ...event.options,
      action: "readJson",
    })

    await store.set(event.props, json)

    event.signal.returnValue = json
  },

  writeJson: async options => {
    const { ensure, event, json, path, spaces } = options

    if (ensure) {
      await ensureFile(path)
    }

    event.signal.returnValue = await writeJson(path, json, {
      spaces,
    })
  },
}
