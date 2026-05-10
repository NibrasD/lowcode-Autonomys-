# AutoBuild

AutoBuild is a low-code platform built specifically for the Autonomys Network. Our goal is to lower the barrier to entry for Web3 development by allowing users to build and deploy decentralized applications (dApps) without needing to write complex smart contracts or frontend code from scratch.

## Features

- **Visual Builder:** A simple drag-and-drop interface for building Web3 components.
- **Smart Contract Generation:** Automatically compile and deploy Solidity contracts to the Auto EVM.
- **Decentralized Hosting:** Upload your frontend directly to the Autonomys Distributed Storage Network (DSN).
- **Template Library:** Jumpstart your project with pre-audited templates for DeFi, NFTs, and DAOs.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed along with a Web3 wallet like MetaMask.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NibrasD/lowcode-Autonomys-.git
   cd lowcode-Autonomys-
   ```

2. Install frontend dependencies and start the builder:
   ```bash
   npm install
   npm run dev
   ```

3. Open a new terminal, install backend dependencies, and start the local server:
   ```bash
   cd server
   npm install
   npm start
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Environment Setup

To enable DSN file uploads, you will need an API key from [Auto Drive](https://ai3.storage/). 

Create a `.env` file in the `server` directory and add your key:
```env
AUTO_DRIVE_API_KEY=your_api_key_here
PORT=3001
```

## How It Works

1. **Design:** Use the visual canvas to drag and drop Web3 elements.
2. **Compile:** The backend generates the Solidity code and compiles it via `solc`.
3. **Deploy:** Deploy your contracts via MetaMask directly to the Auto EVM.
4. **Host:** Click "Upload to DSN" to automatically host your frontend on the Autonomys network.

## License

MIT