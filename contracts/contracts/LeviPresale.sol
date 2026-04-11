// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LeviPresale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable leviToken;
    uint256 public tokensPerUsdc;
    uint256 public totalRaised;
    uint256 public totalSold;
    uint256 public presaleAllocation;
    uint256 public constant MIN_PURCHASE = 1e6;  // 1 USD (6 decimals)
    uint256 public constant MAX_PURCHASE = 100e6; // 100 USD (6 decimals)
    uint256 public constant MAX_WALLET_PURCHASE = 100e6; // Maximum cumulative USD a single wallet can spend
    uint256 public presaleStartTime;
    bool public presaleActive;

    mapping(address => bool) public acceptedTokens;
    mapping(address => uint256) public contributions;

    event TokensPurchased(address indexed buyer, address indexed payToken, uint256 usdAmount, uint256 leviAmount);
    event PresaleEnded(uint256 totalRaised, uint256 totalSold);
    event TokenAccepted(address indexed token, bool accepted);

    constructor(address _leviToken, address[] memory _acceptedTokens, uint256 _tokensPerUsdc) Ownable(msg.sender) {
        leviToken = IERC20(_leviToken);
        tokensPerUsdc = _tokensPerUsdc;
        presaleAllocation = 50_000_000 * 1e18; // 50M tokens for presale (50% of 100M supply)
        presaleActive = true;

        for (uint256 i = 0; i < _acceptedTokens.length; i++) {
            acceptedTokens[_acceptedTokens[i]] = true;
            emit TokenAccepted(_acceptedTokens[i], true);
        }
    }

    function buyTokens(address payToken, uint256 usdAmount) external nonReentrant {
        require(presaleActive, "Presale not active");
        require(block.timestamp >= presaleStartTime, "Presale has not started");
        require(acceptedTokens[payToken], "Token not accepted");
        require(usdAmount >= MIN_PURCHASE, "Below minimum purchase");
        require(usdAmount <= MAX_PURCHASE, "Exceeds max transaction purchase");
        require(contributions[msg.sender] + usdAmount <= MAX_WALLET_PURCHASE, "Exceeds max wallet purchase");

        uint256 leviAmount = getTokensForUsdc(usdAmount);
        require(totalSold + leviAmount <= presaleAllocation, "Exceeds presale allocation");
        require(leviToken.balanceOf(address(this)) >= leviAmount, "Insufficient tokens in contract");

        totalRaised += usdAmount;
        totalSold += leviAmount;
        contributions[msg.sender] += usdAmount;

        IERC20(payToken).safeTransferFrom(msg.sender, address(this), usdAmount);
        leviToken.safeTransfer(msg.sender, leviAmount);

        emit TokensPurchased(msg.sender, payToken, usdAmount, leviAmount);
    }

    function getTokensForUsdc(uint256 usdAmount) public view returns (uint256) {
        return (usdAmount * tokensPerUsdc * 1e18) / 1e6;
    }

    function remainingTokens() external view returns (uint256) {
        return presaleAllocation - totalSold;
    }

    function setTokensPerUsdc(uint256 _tokensPerUsdc) external onlyOwner {
        tokensPerUsdc = _tokensPerUsdc;
    }

    function setAcceptedToken(address token, bool accepted) external onlyOwner {
        acceptedTokens[token] = accepted;
        emit TokenAccepted(token, accepted);
    }

    function withdrawToken(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        IERC20(token).safeTransfer(owner(), balance);
    }

    function setPresaleStartTime(uint256 _startTime) external onlyOwner {
        presaleStartTime = _startTime;
    }
}
