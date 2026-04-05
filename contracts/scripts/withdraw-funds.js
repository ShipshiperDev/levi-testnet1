import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

// Contract Addresses
const PRESALE_ADDRESS = "0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a";
const PATHUSD_ADDRESS = "0x20c0000000000000000000000000000000000000";
const ALPHAUSD_ADDRESS = "0x20c0000000000000000000000000000000000001";

const RPC_URL = "https://rpc.moderato.tempo.xyz";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`Wallet address: ${wallet.address}`);

    const abi = [
        "function withdrawToken(address token) external",
        "function owner() public view returns (address)",
        "function leviToken() public view returns (address)"
    ];
    
    const erc20Abi = [
        "function balanceOf(address account) view returns (uint256)",
        "function symbol() view returns (string)"
    ];

    const presale = new ethers.Contract(PRESALE_ADDRESS, abi, wallet);
    
    // Check Owner
    const contractOwner = await presale.owner();
    if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.error(`Error: Wallet is not the owner. Owner is ${contractOwner}`);
        return;
    }

    const tokensToWithdraw = [PATHUSD_ADDRESS, ALPHAUSD_ADDRESS];

    for (const tokenAddr of tokensToWithdraw) {
        const token = new ethers.Contract(tokenAddr, erc20Abi, provider);
        const symbol = await token.symbol();
        const balance = await token.balanceOf(PRESALE_ADDRESS);

        console.log(`Contract balance of ${symbol}: ${ethers.formatUnits(balance, 6)}`);

        if (balance > 0n) {
            console.log(`Withdrawing ${symbol}...`);
            try {
                const tx = await presale.withdrawToken(tokenAddr);
                console.log(`Transaction sent: ${tx.hash}`);
                console.log(`Waiting for confirmation...`);
                await tx.wait();
                console.log(`Successfully withdrawn ${symbol}!`);
            } catch (err) {
                console.error(`Failed to withdraw ${symbol}:`, err.message);
            }
        } else {
            console.log(`No ${symbol} balance to withdraw.`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
