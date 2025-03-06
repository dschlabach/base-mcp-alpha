# Base MCP Server

A Model Context Protocol (MCP) server that provides onchain tools for Claude AI, allowing it to interact with the Base blockchain and Coinbase API.

## Overview

This MCP server extends Claude's capabilities by providing tools to:

- Retrieve wallet addresses
- Get testnet ETH (on Base Sepolia)
- List wallet balances
- Transfer funds between wallets
- Deploy smart contracts

The server uses the Coinbase SDK to interact with the Base blockchain and Coinbase services.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Coinbase API credentials (API Key Name and Private Key)
- A wallet seed phrase

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/base-mcp.git
   cd base-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```
   # Coinbase API credentials
   # You can obtain these from the Coinbase Developer Portal: https://cdp.coinbase.com/
   COINBASE_API_KEY_NAME=your_api_key_name
   COINBASE_API_PRIVATE_KEY=your_private_key

   # Wallet seed phrase (12 or 24 words)
   # This is the mnemonic phrase for your wallet
   SEED_PHRASE=your seed phrase here
   ```

4. Build the project:
   ```
   npm run build
   ```

5. Test the MCP server:
   ```
   node test-mcp.js
   ```
   This script will verify that your MCP server is working correctly by testing the connection and available tools.

## Examples

See the [examples.md](examples.md) file for detailed examples of how to interact with the Base MCP tools through Claude.

## Integration with Claude Desktop

To add this MCP server to Claude Desktop:

1. Create or edit the Claude Desktop configuration file at:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "base-mcp": {
         "command": "node",
         "args": ["/path/to/base-mcp/build/index.js"],
         "env": {
           "COINBASE_API_KEY_NAME": "your_api_key_name",
           "COINBASE_API_PRIVATE_KEY": "your_private_key",
           "SEED_PHRASE": "your seed phrase here"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

3. Restart Claude Desktop for the changes to take effect.

## Available Tools

### get-address

Retrieves the address for your wallet.

Example query to Claude:
> "What's my wallet address?"

### get-testnet-eth

Gets testnet ETH for your wallet. This can only be called on the Base Sepolia network.

Example query to Claude:
> "Can you get me some testnet ETH for my wallet?"

### list-balances

Lists all balances for your wallet.

Example query to Claude:
> "Show me my wallet balances."

### transfer-funds

Transfers funds from your wallet to another address.

Parameters:
- `destination`: The address to which to transfer funds
- `assetId`: The asset ID to transfer
- `amount`: The amount of funds to transfer

Example query to Claude:
> "Transfer 0.01 ETH to 0x1234567890abcdef1234567890abcdef12345678."

### deploy-contract

Deploys a smart contract to the blockchain.

Parameters:
- `constructorArgs`: The arguments for the contract constructor
- `contractName`: The name of the contract to deploy
- `solidityInputJson`: The JSON input for the Solidity compiler containing contract source and settings
- `solidityVersion`: The version of the solidity compiler

Example query to Claude:
> "Deploy a simple ERC20 token contract for me."

## Security Considerations

- The configuration file contains sensitive information (API keys and seed phrases). Ensure it's properly secured and not shared.
- Consider using environment variables or a secure credential manager instead of hardcoding sensitive information.
- Be cautious when transferring funds or deploying contracts, as these operations are irreversible on the blockchain.

## Troubleshooting

If you encounter issues:

1. Check that your Coinbase API credentials are correct
2. Verify that your seed phrase is valid
3. Ensure you're on the correct network (Base Sepolia for testnet operations)
4. Check the Claude Desktop logs for any error messages

## License

[MIT License](LICENSE)
