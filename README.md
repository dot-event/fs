# dot-file

Filesystem operations with `dot-store`.

![beavis](https://media1.tenor.com/images/a65134d2c920a7d10312416c12ee1234/tenor.gif?itemid=7431307)

## Install

```bash
npm install --save dot-event dot-store dot-file
```

## Usage

```js
import dotEvent from "dot-event"
import dotStore from "dot-store"
import fs from "dot-file"

const events = dotEvent()
const store = dotStore(events)

fs({ events, store })

const id = Math.random()
const path = `${__dirname}/id.json`

await events.fs("writeJson.test", { json: { id }, path })
store.get("fs.writeJson.test").success // true

await events.fs("readJson.test", { path })
store.get("fs.readJson.test.id") // id
```
