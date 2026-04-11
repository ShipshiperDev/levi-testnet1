import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Redeploying Presale with account:", deployer.address);
  
  const tokenAddress = "0xBB8da57242a65B8C752866B8305D3D942f946f5b";
  
  const acceptedTokens = [
    "0x20c0000000000000000000000000000000000000", // pathUSD
    "0x20c0000000000000000000000000000000000001"  // AlphaUSD
  ];
  const rate = 20000;
  
  console.log("Deploying new LeviPresale ($200 Limit)...");
  const LeviPresale = await hre.ethers.getContractFactory("LeviPresale");
  const presale = await LeviPresale.deploy(tokenAddress, acceptedTokens, rate);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  
  console.log("-----------------------------------------");
  console.log("🚀 New Presale Deployed!");
  console.log(`NEW_PRESALE_ADDRESS="${presaleAddress}"`);
  console.log("-----------------------------------------");
  console.log("Action Required:");
  console.log("1. Transfer LEVI tokens to this new address for it to function.");
  console.log("2. Update .env.local with this new address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
