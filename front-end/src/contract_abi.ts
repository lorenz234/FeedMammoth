export const CONTRACT_ADDRESS = "0x590557c2763b3EC19E572eD3AbcC53303c5f4be7";
export const CONTRACT_ABI = [
    {
      "inputs": [{ "internalType": "address", "name": "_xpToken", "type": "address" }],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "bestHash",
      "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bestUser",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
      "name": "countLeadingZeros",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyWithdrawXP",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "feed_mammoth",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "finish_round",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "indexUser",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "indexCounter",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_newXPToken", "type": "address" }],
      "name": "setXPToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalUserCalls",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "userStats",
      "outputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "bytes32", "name": "bestHash", "type": "bytes32" },
        { "internalType": "uint256", "name": "numCalls", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "xpToken",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": false, "internalType": "bytes32", "name": "newHash", "type": "bytes32" }
      ],
      "name": "HashUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
        { "indexed": false, "internalType": "bytes32", "name": "winningHash", "type": "bytes32" },
        { "indexed": false, "internalType": "uint256", "name": "xpReward", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "totalCalls", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "numCalls", "type": "uint256" }
      ],
      "name": "RoundFinished",
      "type": "event"
    }
  ];
  