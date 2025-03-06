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
const coinbase_sdk_2 = require("@coinbase/coinbase-sdk");
const dotenv = __importStar(require("dotenv"));
async function main() {
    dotenv.config();
    const apiKeyName = process.env.COINBASE_API_KEY_NAME;
    const privateKey = process.env.COINBASE_API_PRIVATE_KEY;
    const seedPhrase = process.env.SEED_PHRASE;
    if (!apiKeyName || !privateKey || !seedPhrase) {
        console.error("Please set COINBASE_API_KEY_NAME, COINBASE_API_PRIVATE_KEY, and SEED_PHRASE environment variables");
        process.exit(1);
    }
    coinbase_sdk_1.Coinbase.configure({ apiKeyName, privateKey });
    // Initialize wallet with seed phrase
    const wallet = await coinbase_sdk_2.Wallet.import({
        mnemonicPhrase: seedPhrase,
        networkId: "base-sepolia",
    });
    const all = await wallet.listAddresses();
    console.log(" all:", all);
    const address = await wallet.getDefaultAddress();
    console.log(" address:", address.getId());
    const transfer = await wallet.createTransfer({
        destination: "0x9E95f497a7663B70404496dB6481c890C4825fe1",
        amount: 0.0001,
        assetId: coinbase_sdk_1.Coinbase.assets.Eth,
    });
    await transfer.wait();
    if (transfer.getStatus() === coinbase_sdk_1.TransferStatus.COMPLETE) {
        console.log("Transfer completed");
        console.log(transfer.toString());
    }
    else {
        console.log("Transfer failed");
        console.log(transfer.toString());
    }
}
main().catch(console.error);
