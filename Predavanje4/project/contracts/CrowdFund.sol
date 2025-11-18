// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract CrowdFund {
    address public owner;
    uint public goal;
    uint public totalRaised;

    constructor(uint _goal) {
        owner = msg.sender;
        goal = _goal;
    }

    function donate() external payable {
        require(msg.value > 0, "No zero donations");
        totalRaised += msg.value;
    }

    function goalReached() external view returns (bool) {
        return totalRaised >= goal;
    }
}