// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LockBox {
    mapping(address => uint256) private _balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        _balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Must withdraw > 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
