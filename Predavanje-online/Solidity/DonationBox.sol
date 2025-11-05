// SPDX-License-Identifier: NONE

pragma solidity ^0.8.0;

contract DonationBox{
    address public owner;
    uint public totalDonations;

    event DonationReceived(address donor, uint amount);
    event Withdraw(address indexed to, uint amount);

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "You are not the owner!");
        _;
    }

    function donate() public payable {
        require(msg.value > 0, "Value can not be empty!");
        totalDonations += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner{

        uint amount = address(this).balance;
        payable(owner).transfer(amount);
        emit Withdraw(owner, amount);
    }

    function getBalance() public view returns (uint){
        return address(this).balance;
    }
}