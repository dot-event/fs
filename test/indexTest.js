import dotEvent from "dot-event"
import dotStore from "dot-store"
import fs from "../dist/fs"

test("read/write json (empty)", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs({
    json: { id },
    path,
    writeJson: true,
  })

  expect(store.get("success")).toBe(true)

  await events.fs({ path, readJson: true })

  expect(store.get("id")).toBe(id)
})

test("read/write json (prop)", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs("test", {
    json: { id },
    path,
    writeJson: true,
  })

  expect(store.get("test").success).toBe(true)

  await events.fs("test", { path, readJson: true })

  expect(store.get("test.id")).toBe(id)
})
