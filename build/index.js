"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const coinbase_sdk_1 = require("@coinbase/coinbase-sdk");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const version_js_1 = require("./version.js");
const dotenv = __importStar(require("dotenv"));
// Tool definitions
const getAddressTool = {
    name: "get-address",
    description: "Get the address for the wallet",
    inputSchema: {
        type: "object",
    },
};
const getTestnetEthTool = {
    name: "get-testnet-eth",
    description: "Get the testnet ETH balance for the wallet. Can only be called on Base Sepolia",
    inputSchema: {
        type: "object",
    },
};
const listBalancesTool = {
    name: "list-balances",
    description: "List all balances for a wallet",
    inputSchema: {
        type: "object",
    },
};
const transferFundsTool = {
    name: "transfer-funds",
    description: "Transfer funds from one wallet to another",
    inputSchema: {
        type: "object",
        properties: {
            destination: {
                type: "string",
                description: "The address to which to transfer funds",
            },
            assetId: {
                type: "string",
                enum: Object.values(coinbase_sdk_1.Coinbase.assets),
                description: "The asset ID to transfer",
            },
            amount: {
                type: "number",
                description: "The amount of funds to transfer",
            },
        },
    },
};
const deployContractTool = {
    name: "deploy-contract",
    description: "Deploy a contract",
    inputSchema: {
        type: "object",
        properties: {
            constructorArgs: {
                type: "array",
                description: "The arguments for the contract constructor",
                items: {
                    type: "string",
                },
            },
            contractName: {
                type: "string",
                description: "The name of the contract to deploy",
            },
            solidityInputJson: {
                type: "string",
                description: "The JSON input for the Solidity compiler containing contract source and settings",
            },
            solidityVersion: {
                type: "string",
                description: "The version of the solidity compiler",
            },
        },
    },
};
async function main() {
    dotenv.config();
    const apiKeyName = process.env.COINBASE_API_KEY_NAME;
    const privateKey = process.env.COINBASE_API_PRIVATE_KEY;
    const seedPhrase = process.env.SEED_PHRASE;
    if (!apiKeyName || !privateKey || !seedPhrase) {
        console.error("Please set COINBASE_API_KEY_NAME, COINBASE_API_PRIVATE_KEY, and SEED_PHRASE environment variables");
        process.exit(1);
    }
    const server = new index_js_1.Server({
        name: "Base MCP Server",
        version: version_js_1.version,
    }, {
        capabilities: {
            tools: {},
        },
    });
    coinbase_sdk_1.Coinbase.configure({ apiKeyName, privateKey });
    // Initialize wallet with seed phrase
    const wallet = await coinbase_sdk_1.Wallet.import({
        mnemonicPhrase: seedPhrase,
        networkId: "base-sepolia",
    });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        console.error("Received ListToolsRequest");
        return {
            tools: [
                getAddressTool,
                listBalancesTool,
                getTestnetEthTool,
                transferFundsTool,
                deployContractTool,
            ],
        };
    });
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        console.error("Received CallToolRequest:", request);
        try {
            switch (request.params.name) {
                case "get-address": {
                    const address = await wallet.getDefaultAddress();
                    return {
                        content: [{ type: "text", text: address.getId() }],
                    };
                }
                case "get-testnet-eth": {
                    const network = wallet.getNetworkId();
                    if (network !== "base-sepolia") {
                        throw new Error("Network is not base-sepolia");
                    }
                    const faucet = await wallet.faucet();
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Faucet request sent: ${faucet.getTransactionHash()}`,
                            },
                        ],
                    };
                }
                case "transfer-funds": {
                    const { destination, assetId, amount } = request.params
                        .arguments;
                    const transfer = await wallet.createTransfer({
                        destination,
                        amount,
                        assetId,
                    });
                    await transfer.wait();
                    return {
                        content: [
                            {
                                type: "text",
                                text: transfer.toString(),
                            },
                        ],
                    };
                }
                case "list-balances": {
                    const balances = await wallet.listBalances();
                    console.error(" balances:", balances);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(Object.fromEntries(balances)),
                            },
                        ],
                    };
                }
                case "deploy-contract": {
                    const { constructorArgs, contractName, solidityInputJson, solidityVersion, } = request.params.arguments;
                    console.error("constructorArgs:", constructorArgs);
                    console.error("contractName:", contractName);
                    console.error("solidityInputJson:", solidityInputJson);
                    console.error("solidityVersion:", solidityVersion);
                    try {
                        const contract = await wallet.deployContract({
                            constructorArgs,
                            contractName,
                            solidityInputJson,
                            solidityVersion,
                        });
                        await contract.wait();
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: contract.toString(),
                                },
                            ],
                        };
                    }
                    catch (error) {
                        console.error("Error deploying contract:", error);
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify({
                                        error: error instanceof Error ? error.message : String(error),
                                    }),
                                },
                            ],
                        };
                    }
                }
                default:
                    throw new Error(`Unknown tool: ${request.params.name}`);
            }
        }
        catch (error) {
            console.error("Error calling tool:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                        }),
                    },
                ],
            };
        }
    });
    const transport = new stdio_js_1.StdioServerTransport();
    console.error("Connecting server to transport...");
    await server.connect(transport);
    console.error("Base MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
