import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // 1. Deploy LeviToken
  const LeviToken = await hre.ethers.getContractFactory("LeviToken");
  const token = await LeviToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("LeviToken deployed to:", tokenAddress);

  // 2. Deploy LeviPresale
  const acceptedTokens = [
    "0x20c0000000000000000000000000000000000000", // pathUSD
    "0x20c0000000000000000000000000000000000001"  // AlphaUSD
  ];
  const rate = 20000;
  
  const LeviPresale = await hre.ethers.getContractFactory("LeviPresale");
  const presale = await LeviPresale.deploy(tokenAddress, acceptedTokens, rate);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("LeviPresale deployed to:", presaleAddress);

  // 3. Fund the Presale Contract with 500M tokens
  console.log("Funding presale with 500,000,000 LEVI...");
  const presaleAmount = hre.ethers.parseUnits("500000000", 18);
  const tx = await token.transfer(presaleAddress, presaleAmount);
  await tx.wait();
  console.log("Presale successfully funded!");
  
  console.log("-----------------------------------------");
  console.log("🚀 Deployment Complete!");
  console.log(`NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS="${tokenAddress}"`);
  console.log(`NEXT_PUBLIC_TESTNET_PRESALE_ADDRESS="${presaleAddress}"`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
