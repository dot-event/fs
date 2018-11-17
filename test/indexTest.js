import dotEvent from "dot-event"
import dotStore from "dot-store"
import fs from "../dist/fs"

test("writeJson & readJson", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs({
    action: "writeJson",
    json: { id },
    path,
  })

  const readOut = await events.fs({
    action: "readJson",
    path,
  })

  expect(readOut.id).toBe(id)
  expect(store.get("id")).not.toBe(id)
})

test("writeJson & storeReadJson", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs({
    action: "writeJson",
    json: { id },
    path,
  })

  const out = await events.fs({
    action: "storeReadJson",
    path,
  })

  expect(out.id).toBe(id)
  expect(store.get("id")).toBe(id)
})

test("writeJson & storeReadJson with props", async () => {
  const events = dotEvent()
  const store = dotStore(events)

  fs({ events, store })

  const id = Math.random()
  const path = `${__dirname}/fixture/writeJson.json`

  await events.fs("test", {
    action: "writeJson",
    json: { id },
    path,
  })

  const out = await events.fs("test", {
    action: "storeReadJson",
    path,
  })

  expect(out.id).toBe(id)
  expect(store.get("test.id")).toBe(id)
})
