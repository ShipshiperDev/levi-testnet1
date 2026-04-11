import hre from "hardhat";

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const presaleAddr = "0xe4f23F93632F36e1849A81a69E52C7fe8eF2CeA9";
  const leviTokenAddr = "0xBB8da57242a65B8C752866B8305D3D942f946f5b";

  console.log("Using owner wallet:", owner.address);

  const presale = await hre.ethers.getContractAt("LeviPresale", presaleAddr);
  const token = await hre.ethers.getContractAt("IERC20", leviTokenAddr);

  // 1. Withdraw everything from presale to owner
  console.log("Withdrawing all LEVI from presale to owner...");
  const tx1 = await presale.withdrawToken(leviTokenAddr);
  await tx1.wait();
  
  const fullBalance = await token.balanceOf(owner.address);
  console.log(`Current owner balance: ${hre.ethers.formatUnits(fullBalance, 18)} LEVI`);

  // 2. Send exactly 50,000,000 back to presale
  const targetAmount = hre.ethers.parseUnits("50000000", 18);
  console.log("Sending exactly 50,000,000 LEVI back to the presale contract...");
  const tx2 = await token.transfer(presaleAddr, targetAmount);
  await tx2.wait();

  // 3. Final Audit
  const finalOwner = await token.balanceOf(owner.address);
  const finalPresale = await token.balanceOf(presaleAddr);

  console.log("-----------------------------------------");
  console.log("FINAL DISTRIBUTION AUDIT:");
  console.log("Owner Balance  :", hre.ethers.formatUnits(finalOwner, 18), "LEVI");
  console.log("Presale Balance:", hre.ethers.formatUnits(finalPresale, 18), "LEVI");
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
