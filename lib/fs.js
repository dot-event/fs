// Packages
import { argvRelay } from "@dot-event/argv"
import {
  copy,
  ensureDir,
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
import tmp from "tmp-promise"
import jsYaml from "js-yaml"

// Constants
const argvAlias = {
  c: ["copy"],
  e: ["pathExists"],
  m: ["move"],
  r: ["remove"],
  rf: ["readFile"],
  rj: ["readJson"],
  ry: ["readYaml"],
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

      fsEnsureDir: async options => {
        const { event, path, temp } = options

        if (temp) {
          event.signal.returnValue = await tmp.dir(options)
        } else {
          await ensureDir(path)
          event.signal.returnValue = { path }
        }
      },

      fsEnsureFile: async options => {
        const { event, path } = options

        event.signal.returnValue = await ensureFile(path)
      },

      fsEnsureSymlink: async options => {
        const { dest, event, src, type } = options

        event.signal.returnValue = await ensureSymlink(
          src,
          dest,
          type
        )
      },

      fsEnsureTmp: async options => {
        const { event, save } = options
        const { path } = await tmp.file(options)

        if (save) {
          await events.set(event.props, path)
        }

        event.signal.returnValue = path
      },

      fsMove: async ({ dest, event, src }) => {
        event.signal.returnValue = await move(
          src,
          dest,
          event.options
        )
      },

      fsPathExists: async ({ event, path, save }) => {
        const exists = await pathExists(path)

        if (save) {
          await events.set(event.props, { exists })
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
        const { event, events, json, path, save } = options

        let out

        try {
          out = await readJson(path)

          if (save) {
            await events.set(event.props, out || json)
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

      fsReadYaml: async options => {
        const {
          event,
          events,
          path,
          replace,
          save,
        } = options

        let out = await readFile(path)

        if (replace) {
          out = out
            .toString()
            .replace(/\$\{([^}]+)\}/g, (_, match) =>
              replace(match)
            )
        }

        const parsed = jsYaml.safeLoad(out)

        if (save) {
          await events.set(event.props, parsed)
        }

        event.signal.returnValue = parsed
      },

      fsRemove: async ({ event, path }) => {
        event.signal.returnValue = await remove(path)
      },

      fsSetupOnce: () => events.argv({ alias: argvAlias }),

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
        } = options

        if (ensure) {
          await ensureFile(path)
        }

        const out = await writeJson(path, json, {
          spaces,
        })

        if (save) {
          await events.set(event.props, json)
        }

        event.signal.returnValue = out
      },

      fsWriteTmp: async options => {
        const { body, event, props } = options
        const path = await events.fsEnsureTmp(props)

        await writeFile(path, body)

        event.signal.returnValue = path
      },

      fsWriteYaml: async options => {
        const { ensure, event, path, yaml } = options

        if (ensure) {
          await ensureFile(path)
        }

        event.signal.returnValue = await writeFile(
          path,
          jsYaml.safeDump(yaml)
        )
      },
    })

  return options
}
