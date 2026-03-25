// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../LockBox.sol";

contract ReentrantAttacker {
    LockBox private target;
    bool private attacking;

    constructor(address _target) {
        target = LockBox(_target);
    }

    function attack() external payable {
        target.deposit{value: msg.value}();
        target.withdraw();
    }

    receive() external payable {
        if (!attacking) {
            attacking = true;
            try target.withdraw() {} catch {}
            attacking = false;
        }
    }
}
