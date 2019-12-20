# metamask-provider

Metamask provider to connect Matic Network. In future, plan is to use mm-plugin to handle multiple networks.

### Installation

```bash
$ npm install --save @maticnetwork/metamask-provider
```

### Usage

Create network providers by instantiating provider objects.

```js
import MetamaskProvider from "@maticnetwork/metamask-provider"

// enable ethereum metamask
window.ethereum.enable()

// create ropsten provider
const ropstenProvider = new MetamaskProvider(window.ethereum, {
  url: "https://ropsten.infura.io/v3/<your-infura-api-key>"
})

// create matic testnet provider
const maticTestnetProvider = new MetamaskProvider(window.ethereum, {
  url: "https://testnet.matic.network"
})
```

Use these providers to create `Web3` objects to use `web3` apis.

### License

MIT
