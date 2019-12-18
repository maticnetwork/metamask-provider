<template>
  <div class="container">
    <div>
      <h1 class="title">app</h1>
      <h2 class="subtitle">Matamask Provide Example</h2>
      <div class="links"></div>
      <button @click="sendEthOnEthereum">Send Eth on Ethereum</button>
      <button @click="sendEthOnMatic">Send Eth on Matic</button>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
import "~/dist/metamask-provider.js";

window.currentWeb3 = new Web3(ethereum);
window.mainWeb3 = new Web3(
  new MetamaskProvider(ethereum, {
    url: "https://ropsten.infura.io/v3/<API-KEY>"
  })
);
window.maticWeb3 = new Web3(
  new MetamaskProvider(ethereum, {
    url: "https://testnet2.matic.network"
  })
);

const p = currentWeb3.eth.getAccounts().then(accounts => {
  console.log(accounts);
  return accounts;
});

export default {
  methods: {
    sendEthOnEthereum() {
      p.then(function(accounts) {
        return mainWeb3.eth
          .sendTransaction({
            from: accounts[0],
            to: accounts[0],
            value: 1
          })
          .on("transactionHash", result => {
            console.log(result);
          });
      });
    },
    sendEthOnMatic() {
      p.then(function(accounts) {
        return maticWeb3.eth
          .sendTransaction({
            from: accounts[0],
            to: accounts[0],
            value: 1
          })
          .on("transactionHash", result => {
            console.log(result);
          });
      });
    }
  }
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
