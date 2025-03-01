// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XPToken is ERC20 {
    constructor(address _address) ERC20("Experience Points", "XP") {
        // Mint 1 billion tokens with 18 decimals
        // 1,000,000,000 * 10^18
        _mint(_address, 1000000000 * 10 ** decimals());
    }
}
