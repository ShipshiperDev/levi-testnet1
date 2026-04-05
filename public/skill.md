---
name: LEVI Agent Purchase Skill
description: Protocol for AI agents to autonomously participate in the LEVI token presale on the Tempo Network.
version: 1.0.0
author: LEVI Ecosystem
---

# LEVI Autonomous Agent Skill (LAP-1)

This protocol defines the standard interface for AI agents (LLM-based or automated) to interact with the LEVI ecosystem. By following this skill, an agent can autonomously approve stablecoin spending and execute token purchases.

## 🔗 Protocol Environment

- **Network**: Tempo Testnet (Moderato)
- **Chain ID**: `42431`
- **RPC URL**: `https://rpc.moderato.tempo.xyz`
- **Explorer**: `https://explore.testnet.tempo.xyz`

## 💎 Contract Registry

| Contract | Address |
| :--- | :--- |
| **LEVI Token** | `0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA` |
| **LEVI Presale** | `0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a` |
| **pathUSD** | `0x20c0000000000000000000000000000000000000` |
| **AlphaUSD** | `0x20c0000000000000000000000000000000000001` |

## 🛠 Interface (ABI)

### 1. Token Approval (ERC-20)
Agents must ensure the Presale contract is approved to spend the target stablecoin.
```json
[
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
]
```

### 2. Token Purchase (LeviPresale)
```json
[
  { "inputs": [{ "name": "payToken", "type": "address" }, { "name": "usdAmount", "type": "uint256" }], "name": "buyTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
]
```

## 🔄 Autonomous Workflow

To execute a purchase, the agent MUST follow these exact steps:

1.  **Check Balance**: Ensure the wallet has enough stablecoin (`pathUSD` or `AlphaUSD`).
2.  **Verify Allowance**: Check if `LeviPresale` (`0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a`) has at least the total purchase amount approved.
3.  **Execute Approval (If needed)**: Call `approve(0xEaF98604ab7e512B0551A9bc69c4b229F9815D3a, amount)` on the stablecoin contract.
4.  **Execute Buy**: Call `buyTokens(payTokenAddress, amount)` on the Presale contract.
    - *Note: `usdAmount` is in 6 decimals (e.g., $1.00 = 1000000).*

## ⚠️ Security Policy
- Agents should never share their private keys.
- Always verify transaction hashes on the Tempo Explorer.
- This skill assumes the agent has access to a funded wallet on Chain 42431.
