// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

contract CrowdFund {
    address public owner;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    bool public goalReached;
    bool public fundsWithdrawn;

    struct Donor {
        address donor;
        uint amount;
    }

    mapping(address => uint) public contributions;
    Donor[] public donors;

    event DonationReceived(address indexed donor, uint amount);
    event GoalReached(uint totalAmount);
    event FundsWithdrawn(address owner, uint amount);
    event RefundIssued(address donor, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier campaignActive() {
        require(block.timestamp < deadline, "Campaign still active");
        _;
    }

    modifier campaignEnded() {
        require(block.timestamp >= deadline, "Campaign ended");
        _;
    }

    constructor(uint _goal, uint _durationMinutes) {
        owner = msg.sender;
        goal = _goal * 1 ether;
        deadline = block.timestamp + (_durationMinutes * 1 minutes);
    }

    function donate() public payable campaignActive {
        require(msg.value > 0, "No ether sent");
        contributions[msg.sender] += msg.value;
        donors.push(Donor(msg.sender, msg.value));
        totalRaised += msg.value;

        emit DonationReceived(msg.sender, msg.value);

        if (totalRaised >= goal && !goalReached) {
            goalReached = true;
            emit GoalReached(totalRaised);
        }
    }

    function withdrawFunds() public campaignEnded onlyOwner {
        require(goalReached, "Goal not reached");
        require(!fundsWithdrawn, "Already withdrawn");
        fundsWithdrawn = true;

        uint amount = address(this).balance;
        payable(owner).transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    function refund() public campaignEnded {
        require(!goalReached, "Goal was reached");
        uint contributed = contributions[msg.sender];
        require(contributed > 0, "No contribution");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributed);
        emit RefundIssued(msg.sender, contributed);
    }

    function getDonors() public view returns (Donor[] memory) {
        return donors;
    }

    function getTimeLeft() public view returns (uint) {
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}