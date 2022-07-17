[![npm](https://img.shields.io/npm/v/@grapherjs/nextjs.svg)](https://www.npmjs.com/package/@grapherjs/nextjs)

# nextjs-grapherjs

A client implementation for Grapherjs in Next.js. Check out Grapherjs's [Node logging documentation](https://grapherjs.com/docs/api#overview) for more.

### Usage

The nextjs-grapherjs library is compliant with the Grapherjs API. Using nextjs-grapherjs is easy for a variety of scenarios: logging, working with devices and inputs, searching, and facet searching.

### Getting Started

```js
import Grapherjs from "grapherjs";

const client = new Grapherjs({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});
```

### Logging Middleware

````js
import express from "express";
import Grapherjs from "grapherjs";

const app = express();

const grapherjs = new Grapherjs({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

export default grapherjs.withTracing(function handler(req, res) {
  ...
})

### Custom Logging

There are two ways to send log information to Grapherjs via nextjs-grapherjs. The first is to simply call client.log with an appropriate input token:

```js
client.log(req, res, { data: "custom log data" }, (data) => {
  // Callback
});
````

Note that the callback in the above example is optional, if you prefer the 'fire and forget' method of logging:

```js
client.log(req, res, { data: "custom log data" });
```

## Installation

```sh
# Using npm
npm install @grapherjs/nextjs

# Using yarn
yarn add @grapherjs/nextjs
```
