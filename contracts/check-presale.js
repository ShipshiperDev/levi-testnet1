import { ethers } from "ethers";

const RPC_URL = "https://rpc.moderato.tempo.xyz";
const PRESALE_ADDRESS = "0xaADBf03840bE502eCDa83CfDaE2279701Ba2C92E";
const PATH_USD = "0x20c0000000000000000000000000000000000000";

const abi = [
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const presale = new ethers.Contract(PRESALE_ADDRESS, abi, provider);
  const pathUsd = new ethers.Contract(PATH_USD, abi, provider);

  const owner = await presale.owner();
  const balance = await pathUsd.balanceOf(PRESALE_ADDRESS);

  console.log("Presale Owner:", owner);
  console.log("pathUSD balance in Presale:", ethers.formatUnits(balance, 6));
}

main().catch(console.error);
