import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const wallet = new ethers.Wallet("0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17", provider);

  const pathUSD  = "0x20c0000000000000000000000000000000000000";
  const alphaUSD = "0x20c0000000000000000000000000000000000001";
  const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];

  const path  = new ethers.Contract(pathUSD, abi, provider);
  const alpha = new ethers.Contract(alphaUSD, abi, provider);

  const [pathBal, alphaBal] = await Promise.all([
    path.balanceOf(wallet.address),
    alpha.balanceOf(wallet.address),
  ]);

  console.log("Deployer wallet:", wallet.address);
  console.log("pathUSD balance: ", ethers.formatUnits(pathBal, 6));
  console.log("AlphaUSD balance:", ethers.formatUnits(alphaBal, 6));

  // Check if AlphaUSD supports approve (test with zero amount)
  try {
    const tx = await alpha.connect(wallet).estimateGas.approve(
      "0x3e786caE4CeaBA29551b7Cc66cF8BcC24D3962Ae", 0
    );
    console.log("AlphaUSD approve() gas estimate OK:", tx.toString());
  } catch (e) {
    console.log("AlphaUSD approve() failed:", e.message);
  }
}

main().catch(console.error);
