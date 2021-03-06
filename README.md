# simple-peer-bootstrap

Bootstrap connections to get into a webrtc network

simple-peer-bootstrap creates a simple way to set up the initial
[simple-peer](https://npmjs.com/package/simple-peer) connection into the network
you create, allowing you to focus on things like your application.

This package ONLY handles bootstrapping a connection with a known server,
everything else (like setting up more connections, data/protocol handling, etc)
is left to the application.

No security features, like passwords or an extra encryption layer, are provided.

## Install

```sh
npm install --save simple-peer-bootstrap
```

## Usage

### Client

Available in both the browser & node.

```js
const bootstrap = require('simple-peer-bootstrap');

const peer = bootstrap.connect('/spbootstrap');

peer.on('connect', () => {
  console.log('READY');
});
```

### Server

Only available in node.

```js
const bootstrap = require('simple-peer-bootstrap');

function handler(peer) {
  console.log('New peer connection:', peer);
}

// Bootstrap endpoint in express
const app = require('express')();
app.use('/spbootstrap', bootstrap.middleware(handler));

// Set up a stand-alone server
const server = bootstrap.server(handler);
server.listen(8080);

// Or re-use an existing server
bootstrap.server({
  server: preExistingHttpServer,
}, handler);
```

## API

### Main

 Method                        | Description
 ----------------------------- | -----------
 `.bootstrap(url)`             | Initiates a connect request to the given url, returns a connecting simple-peer instance
 `.middleware(handler)`        | Returns express-compatible middleware for receiving connect requests, handing all bootstrapped simple-peer connections to the given handler
 `.server([options], handler)` | Setup or re-use a server for receiving connect requests, handing all bootstrapped simple-peer connections to the given handler

### Server

The server has the following options available:

 Option   | Description
 -------- | -----------
 `server` | The server to attach to, creates a new one if not given
