const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config("../.env");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
    },
    ganache: {
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: "http://127.0.0.1:7545",
          addressIndex: 0,
        })
      },
      network_id: 5777
    },
    goerli_infura: {
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: "wss://goerli.infura.io/ws/v3/fd5789e4cee64e8f9944b499f2232c82",
          addressIndex: 0,
        })
      },
      network_id: 5
    },
    ropsten_infura: {
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: "wss://ropsten.infura.io/ws/v3/fd5789e4cee64e8f9944b499f2232c82",
          addressIndex: 0,
        })
      },
      network_id: 3
    }
  },
  compilers: {
    solc: {
      version : "^0.8.0"
    }

  }
};
