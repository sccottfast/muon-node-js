const { ethCall, soliditySha3 } = MuonAppUtils

const ABI_getTx = [
  {
    inputs: [{ internalType: "uint256", name: "_txId", type: "uint256" }],
    name: "getTx",
    outputs: [
      { internalType: "uint256", name: "txId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "fromChain", type: "uint256" },
      { internalType: "uint256", name: "toChain", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address", name: "nftContract", type: "address" },
      { internalType: "uint256[]", name: "itemIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
]

module.exports = {
  APP_NAME: 'mrc1155_bridge',
  APP_ID: 17,

  onRequest: async function (request) {
    let {
      method,
      data: { params }
    } = request
    switch (method) {
      case 'claim':
        let { depositAddress, depositTxId, depositNetwork } = params
        //TODO: check chain
        if (!depositAddress) throw { message: 'Invalid contarct address' }
        if (!depositTxId) throw { message: 'Invalid deposit Tx Id' }
        if (!depositNetwork) throw { message: 'Invalid deposit Network' }
        let result = await ethCall(
          depositAddress,
          'getTx',
          [depositTxId],
          ABI_getTx,
          depositNetwork
        )
        return result

      default:
        throw { message: `Unknown method ${params}` }
    }
  },

  hashRequestResult: function (request, result) {
    let {
      method,
      data: { params }
    } = request

    switch (method) {
      case 'claim':
        let { depositAddress } = request.data.params

        let { txId, tokenId, fromChain, toChain, user, itemIds,  amounts } = result

        return soliditySha3([
          { type: 'uint32', value: this.APP_ID },
          { type: 'uint256', value: txId },
          { type: 'uint256', value: tokenId },
          { type: 'uint256', value: fromChain },
          { type: 'uint256', value: toChain },
          { type: 'address', value: user },
          { type: 'uint256[]', value: itemIds },
          { type: 'uint256[]', value: amounts }
        ])

      default:
        return null
    }
  }
}
