import hre from "hardhat";

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const oldPresaleAddr = "0xeF1DF05F9DE1f20adF66Fc95E2702BACebd20260";
  const newPresaleAddr = "0xe4f23F93632F36e1849A81a69E52C7fe8eF2CeA9";
  const leviTokenAddr = "0xBB8da57242a65B8C752866B8305D3D942f946f5b";

  console.log("Using owner wallet:", owner.address);

  // 1. Get contracts
  const oldPresale = await hre.ethers.getContractAt("LeviPresale", oldPresaleAddr);
  const token = await hre.ethers.getContractAt("IERC20", leviTokenAddr);

  // 2. Withdraw from old to owner
  console.log("Withdrawing tokens from old contract...");
  const tx1 = await oldPresale.withdrawToken(leviTokenAddr);
  await tx1.wait();
  console.log("Withdrawal complete.");

  // 3. Get balance
  const balance = await token.balanceOf(owner.address);
  console.log(`Balance in owner wallet: ${hre.ethers.formatUnits(balance, 18)} LEVI`);

  // 4. Send to new contract
  console.log("Sending tokens to new contract...");
  const tx2 = await token.transfer(newPresaleAddr, balance);
  await tx2.wait();
  console.log("Transfer to new contract complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
