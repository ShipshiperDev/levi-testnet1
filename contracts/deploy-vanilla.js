import fs from "fs";
import { ethers } from "ethers";

const PRIVATE_KEY = "0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17";
const RPC_URL = "https://rpc.moderato.tempo.xyz";
const TESTNET_CHAIN_ID = 42431;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, TESTNET_CHAIN_ID);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("🚀 Deploying contracts from:", wallet.address);

  // 1. Deploy LeviToken
  console.log("Loading LeviToken artifact...");
  const tokenJson = JSON.parse(fs.readFileSync("./artifacts/contracts/LeviToken.sol/LeviToken.json", "utf8"));
  const TokenFactory = new ethers.ContractFactory(tokenJson.abi, tokenJson.bytecode, wallet);
  console.log("Deploying LeviToken...");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ LeviToken deployed to:", tokenAddress);

  // 2. Deploy LeviPresale
  console.log("Loading LeviPresale artifact...");
  const presaleJson = JSON.parse(fs.readFileSync("./artifacts/contracts/LeviPresale.sol/LeviPresale.json", "utf8"));
  const PresaleFactory = new ethers.ContractFactory(presaleJson.abi, presaleJson.bytecode, wallet);

  const acceptedTokens = [
    "0x20c0000000000000000000000000000000000000", // pathUSD
    "0x20c0000000000000000000000000000000000001"  // AlphaUSD
  ];
  const rate = 2000;

  console.log("Deploying LeviPresale...");
  let presale;
  try {
    presale = await PresaleFactory.deploy(tokenAddress, acceptedTokens, rate);
    await presale.waitForDeployment();
  } catch (err) {
    console.error("PRESALE DEPLOYMENT ERROR:", err);
    process.exit(1);
  }
  const presaleAddress = await presale.getAddress();
  console.log("✅ LeviPresale deployed to:", presaleAddress);

  // 3. Fund Presale & Reserves
  const tokenContract = new ethers.Contract(tokenAddress, tokenJson.abi, wallet);
  const decimals = 10n ** 18n;

  console.log("Minting 50,000,000 LEVI to Presale Contract (50%)...");
  const presaleAmt = 50_000_000n * decimals;
  const tx1 = await tokenContract.mint(presaleAddress, presaleAmt);
  await tx1.wait();
  
  console.log("Minting 30,000,000 LEVI to Dev Wallet (30% for LP)...");
  const lpAmt = 30_000_000n * decimals;
  const tx2 = await tokenContract.mint(wallet.address, lpAmt);
  await tx2.wait();

  console.log("Minting 10,000,000 LEVI to Dev Wallet (10% Ecosystem Growth)...");
  const ecoAmt = 10_000_000n * decimals;
  const tx3 = await tokenContract.mint(wallet.address, ecoAmt);
  await tx3.wait();

  console.log("Minting 10,000,000 LEVI to Dev Wallet (10% Staking & Rewards)...");
  const stakingAmt = 10_000_000n * decimals;
  const tx4 = await tokenContract.mint(wallet.address, stakingAmt);
  await tx4.wait();
  
  console.log("✅ Tokens fully minted and distributed!");
  console.log("✅ Presale fully funded!");

  console.log("\n------------------------------------------------");
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log(`NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS="${tokenAddress}"`);
  console.log(`NEXT_PUBLIC_TESTNET_PRESALE_ADDRESS="${presaleAddress}"`);
  console.log("------------------------------------------------");
  
  const deploymentOutputs = {
    NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS: await token.getAddress(),
    NEXT_PUBLIC_TESTNET_PRESALE_ADDRESS: await presale.getAddress()
  };
  fs.writeFileSync("deployed.json", JSON.stringify(deploymentOutputs, null, 2));
}

main().catch(console.error);
