import {
  copy,
  ensureFile,
  ensureSymlink,
  move,
  pathExists,
  readFile,
  readJson,
  remove,
  writeFile,
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
  copy: async ({ dest, event, src }) => {
    event.signal.returnValue = await copy(
      src,
      dest,
      event.options
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

  move: async ({ dest, event, src }) => {
    event.signal.returnValue = await move(
      src,
      dest,
      event.options
    )
  },

  pathExists: async ({ event, path }) => {
    event.signal.returnValue = await pathExists(path)
  },

  readFile: async options => {
    const { body, event, events, path } = options
    let out

    try {
      out = await readFile(path)
    } catch (e) {
      await events.fs(event.props, {
        ...event.options,
        action: "writeFile",
      })
    }

    event.signal.returnValue = out || body
  },

  readJson: async options => {
    const { event, events, json, path } = options
    let out

    try {
      out = await readJson(path)
    } catch (e) {
      if (event.options.ensure) {
        await events.fs(event.props, {
          ...event.options,
          action: "writeJson",
        })
      } else {
        throw e
      }
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

  storeWriteJson: async options => {
    const { event, events, json, store } = options

    event.signal.returnValue = await events.fs(
      event.props,
      {
        ...event.options,
        action: "writeJson",
      }
    )

    await store.set(event.props, json)
  },

  writeFile: async options => {
    const { body, ensure, event, path } = options

    if (ensure) {
      await ensureFile(path)
    }

    event.signal.returnValue = await writeFile(path, body)
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
