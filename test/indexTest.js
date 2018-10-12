import dotEvent from "dot-event"
import dotStore from "dot-store"
import fs from "../dist/fs"

test("read/write json", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs("writeJson.test", { json: { id }, path })
  expect(store.get("fs.writeJson.test").success).toBe(true)

  await events.fs("readJson.test", { path })
  expect(store.get("fs.readJson.test.id")).toBe(id)
})
