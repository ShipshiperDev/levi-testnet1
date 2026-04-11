// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LeviToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;
    bool public mintingFinished = false;

    constructor() ERC20("Levi", "LEVI") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        require(!mintingFinished, "Minting is finished");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function finishMinting() external onlyOwner {
        mintingFinished = true;
    }

    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}
