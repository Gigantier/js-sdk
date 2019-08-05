# Gigantier JavaScript 

[![npm version](https://img.shields.io/npm/v/@gigantier/js-sdk.svg)](https://www.npmjs.com/package/@gigantier/js-sdk)

> SDK to connect your Javascript app to Giganter API.

[API reference](https://docs.gigantier.com/?javascript)

## Installation

Install the package from [npm](https://www.npmjs.com/package/@gigantier/js-sdk) and import in your project.

```bash
npm install --save @gigantier/js-sdk
```

## Usage

To get started, instantiate a new Gigantier client with your credentials.

> **Note:** This requires a [Gigantier](http://gigantier.com) account.

```js
// ESM
import gigantier from '@gigantier/js-sdk';

const client = gigantier({
  clientId: 'XXX',
  clientSecret: 'XXX',
  scope: 'XXX'
});

// CJS
const gigantier = require('@gigantier/js-sdk');

const apiClient = gigantier.client({
  clientId: 'XXX',
  clientSecret: 'XXX',
  scope: 'XXX'
});
```

Alternatively you can include the `UMD` bundle via [UNPKG](https://unpkg.com) like so:

```js
<script src="https://unpkg.com/@gigantier/js-sdk"></script>

<script>
  const apiClient = gigantier.client({
    clientId: 'XXX',
    clientSecret: 'XXX',
    scope: 'XXX'
  });
</script>
```

Check out the [API reference](https://docs.gigantier.com/?javascript) to learn more about authenticating and the available endpoints.

### Custom Host

If you have a different host than default, you'll need to specify your API URL when instantiating:

```js
const apiClient = gigantier({
  client_id: 'XXX',
  clientSecret: 'XXX',
  scope: 'XXX',
  host: 'api.yourdomain.com'
})
```

## Contributing

Thank you for considering contributing to Gigantier Javascript SDK.

## Development

The SDK is built with [ES6 modules](https://strongloop.com/strongblog/an-introduction-to-javascript-es6-modules/) that are bundled using [Rollup](http://rollupjs.org).

If you want to roll your own bundle, or make changes to any of the modules in `src`, then you'll need to install the package dependencies and run rollup while watching for changes.

```
npm install
npm start
```

In the case you want to build the dist file, execute:
```
npm run rollup
```

You can learn more about the Rollup API and configuration [here](https://github.com/rollup/rollup/wiki).

## Release

To release a new version, first update version number at `package.json`, then execute:

```bash
npm install
npm run lint
npm test
npm run rollup
npm publish
```

You need to run `npm login` before `npm publish` if you never did it before.
