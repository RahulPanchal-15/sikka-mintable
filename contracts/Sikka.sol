// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC20Mintable.sol";

contract Sikka is ERC20, ERC20Mintable {

    constructor() ERC20("SIKKA", "SIK") {
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

}