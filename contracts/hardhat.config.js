export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "shanghai",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    tempoTestnet: {
      url: "https://rpc.moderato.tempo.xyz",
      chainId: 42431
    }
  }
};
