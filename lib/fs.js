// Packages
import { argvRelay } from "@dot-event/argv"
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

// Constants
const argvAlias = {
  c: ["copy"],
  e: ["pathExists"],
  m: ["move"],
  r: ["remove"],
  rf: ["readFile"],
  rj: ["readJson"],
  s: ["ensureSymlink"],
  wf: ["writeFile"],
  wj: ["writeJson"],
}

// Composer
export default options => {
  const { events } = options

  if (events.ops.has("fs")) {
    return options
  }

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      fs: argvRelay,

      fsCopy: async ({ dest, event, src }) => {
        event.signal.returnValue = await copy(
          src,
          dest,
          event.options
        )
      },

      fsEnsureSymlink: async options => {
        const { dest, event, src, type } = options

        event.signal.returnValue = await ensureSymlink(
          src,
          dest,
          type
        )
      },

      fsMove: async ({ dest, event, src }) => {
        event.signal.returnValue = await move(
          src,
          dest,
          event.options
        )
      },

      fsPathExists: async ({
        event,
        path,
        save,
        store,
      }) => {
        const exists = await pathExists(path)

        if (save) {
          await store.set(event.props, { exists })
        }

        event.signal.returnValue = exists
      },

      fsReadFile: async options => {
        const { body, event, events, path } = options
        let out

        try {
          out = await readFile(path)
        } catch (e) {
          await events.fsWriteFile(
            event.props,
            event.options
          )
        }

        event.signal.returnValue = out || body
      },

      fsReadJson: async options => {
        const {
          event,
          events,
          json,
          path,
          save,
          store,
        } = options

        let out

        try {
          out = await readJson(path)

          if (save) {
            await store.set(event.props, out || json)
          }
        } catch (e) {
          if (event.options.ensure) {
            await events.fsWriteJson(
              event.props,
              event.options
            )
          } else {
            throw e
          }
        }

        event.signal.returnValue = out || json
      },

      fsRemove: async ({ event, path }) => {
        event.signal.returnValue = await remove(path)
      },

      fsSetup: () => events.argv({ alias: argvAlias }),

      fsWriteFile: async options => {
        const { body, ensure, event, path } = options

        if (ensure) {
          await ensureFile(path)
        }

        event.signal.returnValue = await writeFile(
          path,
          body
        )
      },

      fsWriteJson: async options => {
        const {
          ensure,
          event,
          json,
          path,
          save,
          spaces,
          store,
        } = options

        if (ensure) {
          await ensureFile(path)
        }

        const out = await writeJson(path, json, {
          spaces,
        })

        if (save) {
          await store.set(event.props, json)
        }

        event.signal.returnValue = out
      },
    })

  return options
}
