import hre from "hardhat";

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const presaleAddr = "0xe4f23F93632F36e1849A81a69E52C7fe8eF2CeA9";
  const leviTokenAddr = "0xBB8da57242a65B8C752866B8305D3D942f946f5b";

  const token = await hre.ethers.getContractAt("IERC20", leviTokenAddr);

  const ownerBalance = await token.balanceOf(owner.address);
  const presaleBalance = await token.balanceOf(presaleAddr);

  console.log("-----------------------------------------");
  console.log("LEVI Token Distribution Audit:");
  console.log("Owner Address:", owner.address);
  console.log("Owner Balance:", hre.ethers.formatUnits(ownerBalance, 18), "LEVI");
  console.log("Presale Address:", presaleAddr);
  console.log("Presale Balance:", hre.ethers.formatUnits(presaleBalance, 18), "LEVI");
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
