/* eslint-env browser */

import { Transaction as EthereumTx } from "ethereumjs-tx"
import * as eutils from "ethereumjs-util"
import EthCommon from "ethereumjs-common"
import Web3 from "web3"

// supported methods
const supportedMethods = ["eth_signTransaction", "eth_sendTransaction"]

function getCallback(payload, cb) {
  return function(err, result) {
    const obj = {}
    const keys = ["id", "jsonrpc"]
    keys.forEach(key => {
      obj[key] = payload[key]
    })
    obj.result = result
    cb(err, obj)
  }
}

export default class MetamaskProvider {
  constructor(provider, options = {}) {
    this._provider = provider
    this._url = options.url

    this._currentWeb3 = new Web3(this._provider)
    this._expectedWeb3 = new Web3(this._url)

    this._currentChainId = null
    this._expectedChainId = null
  }

  async getCurrentChainId() {
    if (!this._currentChainId) {
      this._currentChainId = await this._currentWeb3.eth.net.getId()
    }
    return this._currentChainId
  }

  async getExpectedChainId() {
    if (!this._expectedChainId) {
      this._expectedChainId = await this._expectedWeb3.eth.net.getId()
    }
    return this._expectedChainId
  }

  /**
   * Should be used to make async request
   *
   * @method sendAsync
   * @param {Object} payload
   * @param {Function} callback triggered on end with (err, result)
   */
  send(payload, callback) {
    return Promise.all([this.getCurrentChainId(), this.getExpectedChainId()])
      .then(chainIds => {
        const [currentChainId, expectedChainId] = chainIds
        if (currentChainId !== expectedChainId) {
          if (supportedMethods.includes(payload.method)) {
            const fn = getCallback(payload, callback)
            return this.signTx(payload.params[0])
              .then(signedTx => {
                if (payload.method === "eth_sendTransaction") {
                  return new Promise((resolve, reject) => {
                    this._expectedWeb3.eth
                      .sendSignedTransaction(signedTx)
                      .on("transactionHash", txHash => {
                        resolve(txHash)
                      })
                      .on("error", err => {
                        reject(err)
                      })
                  })
                  // return eutils.bufferToHex(eutils.keccak(signedTx))
                } else if (payload.method === "eth_signTransaction") {
                  return signedTx
                }
              })
              .then(result => {
                fn(null, result)
              })
              .catch(err => {
                fn(err, null)
              })
          } else {
            return this._expectedWeb3.currentProvider.send(payload, callback)
          }
        } else {
          return this._currentWeb3.currentProvider.send(payload, callback)
        }
      })
      .catch(e => {
        callback(e, null)
      })
  }

  sendAsync(payload, callback) {
    return this.send(payload, callback)
  }

  // Sign tx
  async signTx(options) {
    const from = options.from
    const [gasLimit, gasPrice, nonce] = await Promise.all([
      !(options.gasLimit || options.gas)
        ? this._expectedWeb3.eth.estimateGas(options)
        : options.gasLimit || options.gas,
      !options.gasPrice
        ? this._expectedWeb3.eth.getGasPrice()
        : options.gasPrice,
      !options.nonce
        ? this._expectedWeb3.eth.getTransactionCount(from, "pending")
        : options.nonce
    ])

    // get chain id
    const chainId = await this.getExpectedChainId()

    // ethereum tx
    const customCommon = EthCommon.forCustomChain(
      "mainnet",
      {
        name: "matic-network",
        networkId: chainId,
        chainId: chainId
      },
      "petersburg"
    )

    const tx = new EthereumTx(
      {
        gas: gasLimit,
        gasLimit,
        gasPrice: Web3.utils.toHex(gasPrice),
        nonce: nonce,
        value: options.value || 0,
        to: options.to || null,
        data: options.data
      },
      { common: customCommon }
    )

    const msgHash = tx.hash(false)
    const s = await this._currentWeb3.eth.sign(
      eutils.bufferToHex(msgHash),
      from
    )
    const rpc = eutils.fromRpcSig(s, tx.getChainId())
    rpc.v += tx.getChainId() * 2 + 8
    tx.s = rpc.s
    tx.v = rpc.v
    tx.r = rpc.r
    return eutils.bufferToHex(tx.serialize())
  }
}
