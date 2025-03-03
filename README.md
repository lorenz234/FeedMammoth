# Feed The Mammoth

## The Game
Feed The Mammoth is an onchain tapping game developed for the Celestia Hackathon under the Conduit G2 track. Players tap to feed the mammoth, triggering an onchain hash game in the backend. The goal is to generate random hashes and compete for the lowest hash to win the round and earn tokens.

## How to Play  
0. **Open the Frontend**: Access the live deployment here: [https://lorenz234.github.io/FeedMammoth/](https://lorenz234.github.io/FeedMammoth/).  
1. **Connect Your Wallet**: Obtain testnet tokens for the [G2 testnet chain](https://hub.conduit.xyz/mammothon-g2-testnet-4a2w8v0xqy) and switch your wallet to this chain.  
2. **Create a Session Key**: Generate a session key and fund it with ETH testnet tokens.  
3. **Feed the Mammoth**: Tap the mammoth to participate in the hash game. The player with the lowest hash wins the round.

## Requirements
- An EVM compatible wallet
- Testnet tokens from for [this G2 testnet chain](https://hub.conduit.xyz/mammothon-g2-testnet-4a2w8v0xqy)

## Technical Details
- **Smart Contract**: Deployed on Conduit G2 Testnet
- **Explorer**: [View Transactions](https://explorer-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz/address/0x590557c2763b3EC19E572eD3AbcC53303c5f4be7)
- **Game Mechanics**: Players generate hashes and the lowest hash wins
- **Leaderboard**: Displays top players based on best hash scores

## Deployment
To deploy the front-end, follow these steps:

1. Navigate to the front-end directory:
   ```sh
   cd front-end
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. For production deployment, build the project:
   ```sh
   npm run build
   ```

## Contributing
This project was developed as part of the Celestia Hackathon in Feb. 2025.

