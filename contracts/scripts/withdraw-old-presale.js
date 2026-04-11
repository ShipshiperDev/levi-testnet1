import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const wallet = new ethers.Wallet("0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17", provider);

  const tokenAddress = "0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA";
  const oldPresaleAddress = "0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a";

  const presaleAbi = ["function withdrawToken(address token) external"];
  const oldPresale = new ethers.Contract(oldPresaleAddress, presaleAbi, wallet);

  console.log("Withdrawing tokens from OLD presale contract...");
  const tx = await oldPresale.withdrawToken(tokenAddress);
  await tx.wait();
  console.log("Tokens successfully withdrawn from OLD presale!");
}

main().catch(console.error);
