import { ethers } from 'ethers';
import 'dotenv/config';

async function main() {
  console.log('\n🤖 [AGENT] INITIALIZING LEVI AUTONOMOUS PURCHASE (LAP-1)');
  console.log('───────────────────────────────────────────────────────');

  // 1. Setup Provider & Wallet
  const RPC_URL = 'https://rpc.moderato.tempo.xyz';
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env');
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`> Wallet connected: ${wallet.address}`);

  // 2. Protocol Registry (from skill.md)
  const CONTRACTS = {
    presale: '0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a',
    pathUSD: '0x20c0000000000000000000000000000000000000',
    levi:    '0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA'
  };

  const BUY_AMOUNT_USD = 3; // 3.00 USD
  const DECIMALS = 6;
  const ATOMIC_AMOUNT = ethers.parseUnits(BUY_AMOUNT_USD.toString(), DECIMALS);

  console.log(`> Target: ${BUY_AMOUNT_USD} USD via pathUSD`);

  // 3. Check pathUSD Balance
  const tokenAbi = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)'
  ];
  const pathUsdContract = new ethers.Contract(CONTRACTS.pathUSD, tokenAbi, wallet);
  
  const balance = await pathUsdContract.balanceOf(wallet.address);
  console.log(`> pathUSD Balance: ${ethers.formatUnits(balance, DECIMALS)}`);

  if (balance < ATOMIC_AMOUNT) {
    console.error('❌ Insufficient pathUSD balance.');
    process.exit(1);
  }

  // 4. Check Allowance
  console.log('> Checking allowance for Presale contract...');
  const allowance = await pathUsdContract.allowance(wallet.address, CONTRACTS.presale);
  console.log(`> Current Allowance: ${ethers.formatUnits(allowance, DECIMALS)}`);

  if (allowance < ATOMIC_AMOUNT) {
    console.log('> Allowance insufficient. Requesting approval...');
    const approveTx = await pathUsdContract.approve(CONTRACTS.presale, ethers.MaxUint256);
    console.log(`> Approval Transaction: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('✅ Approval confirmed.');
  } else {
    console.log('✅ Allowance verified.');
  }

  // 5. Execute Purchase
  console.log('> Executing purchase...');
  const presaleAbi = [
    'function buyTokens(address payToken, uint256 usdAmount) returns ()'
  ];
  const presaleContract = new ethers.Contract(CONTRACTS.presale, presaleAbi, wallet);

  try {
    const buyTx = await presaleContract.buyTokens(CONTRACTS.pathUSD, ATOMIC_AMOUNT);
    console.log(`> Purchase Transaction: ${buyTx.hash}`);
    console.log('> Waiting for confirmation...');
    
    const receipt = await buyTx.wait();
    console.log('✅ Purchase CONFIRMED on-chain.');
    console.log(`> Block: ${receipt.blockNumber}`);

    // Final balance check for LEVI
    const leviContract = new ethers.Contract(CONTRACTS.levi, tokenAbi, wallet);
    const leviBalance = await leviContract.balanceOf(wallet.address);
    console.log(`\n🎉 SUCCESS! Current LEVI Balance: ${ethers.formatUnits(leviBalance, 18)}`);

  } catch (error) {
    console.error('\n❌ PURCHASE FAILED:', error.message);
  }

  console.log('───────────────────────────────────────────────────────\n');
}

main().catch(console.error);
