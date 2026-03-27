// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LKBOXToken is ERC20 {
    event Minted(address indexed user, uint256 ethAmount, uint256 tokenAmount);

    constructor() ERC20("LockBox Token", "LKBOX") {}

    function mint() external payable {
        require(msg.value > 0, "Must send ETH");
        uint256 tokenAmount = msg.value * 1000;
        _mint(msg.sender, tokenAmount);
        emit Minted(msg.sender, msg.value, tokenAmount);
    }
}
