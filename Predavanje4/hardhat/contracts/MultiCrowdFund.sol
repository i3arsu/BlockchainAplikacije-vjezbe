// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
 
/// @title CrowdFundMulti (multi-campaign, pull refunds, liveBalance tracked)
/// @notice Create many campaigns; donations allowed until deadline; owner withdraws on success after deadline; contributors self-claim refunds on failure.
contract MultiCrowdFund {
    struct Campaign {
        address owner;
        string title;       // human-friendly
        uint goal;          // in wei
        uint deadline;      // unix time (seconds)
        uint totalRaised;   // lifetime sum (does NOT go down)
        uint liveBalance;   // withdrawable/refundable amount for this campaign
        bool goalReached;   // flips as soon as totalRaised >= goal
        bool fundsWithdrawn;
    }
 
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions; // campaignId -> donor -> amount
    uint public nextCampaignId;
    bool private _locked; // reentrancy guard
 
    event CampaignCreated(uint indexed id, address indexed owner, string title, uint goal, uint deadline);
    event Donated(uint indexed id, address indexed from, uint amount, uint newTotal, uint liveBalance);
    event GoalReached(uint indexed id, uint amount);
    event FundsWithdrawn(uint indexed id, address indexed owner, uint amount);
    event Refunded(uint indexed id, address indexed to, uint amount);
 
    modifier nonReentrant() {
        require(!_locked, "Reentrancy");
        _locked = true;
        _;
        _locked = false;
    }
    modifier campaignExists(uint id) {
        require(campaigns[id].owner != address(0), "No campaign");
        _;
    }
    modifier onlyOwner(uint id) {
        require(msg.sender == campaigns[id].owner, "Not owner");
        _;
    }
 
    /// @notice Create campaign; `_goal` is in wei; `_durationMinutes` in minutes
    function createCampaign(string memory _title, uint _goal, uint _durationMinutes)
        external
        returns (uint id)
    {
        require(bytes(_title).length != 0, "Title required");
        require(_goal > 0, "Goal > 0");
        require(_durationMinutes > 0, "Duration > 0");
 
        id = nextCampaignId++;
        uint dl = block.timestamp + _durationMinutes * 60;
 
        campaigns[id] = Campaign({
            owner: msg.sender,
            title: _title,
            goal: _goal,
            deadline: dl,
            totalRaised: 0,
            liveBalance: 0,
            goalReached: false,
            fundsWithdrawn: false
        });
 
        emit CampaignCreated(id, msg.sender, _title, _goal, dl);
    }
 
    /// @notice Donate ETH to a specific campaign while active (donations continue even after goal until deadline)
    function donateTo(uint id) external payable campaignExists(id) {
        require(msg.value > 0, "No ETH");
        Campaign storage c = campaigns[id];
        require(block.timestamp < c.deadline && !c.fundsWithdrawn, "Campaign ended");
 
        contributions[id][msg.sender] += msg.value;
        c.totalRaised += msg.value;
        c.liveBalance += msg.value;
 
        if (!c.goalReached && c.totalRaised >= c.goal) {
            c.goalReached = true;
            emit GoalReached(id, c.totalRaised);
        }
 
        emit Donated(id, msg.sender, msg.value, c.totalRaised, c.liveBalance);
    }
 
    /// @notice Owner withdraws all liveBalance for a successful campaign after deadline
    function withdrawFunds(uint id) external campaignExists(id) onlyOwner(id) nonReentrant {
        Campaign storage c = campaigns[id];
        require(block.timestamp >= c.deadline, "Too early");
        require(c.goalReached, "Goal not reached");
        require(!c.fundsWithdrawn, "Already withdrawn");
 
        uint amount = c.liveBalance;
        require(amount > 0, "Nothing to withdraw");
 
        c.fundsWithdrawn = true;     // effects first
        c.liveBalance = 0;
 
        (bool ok, ) = payable(c.owner).call{value: amount}("");
        require(ok, "Transfer failed");
 
        emit FundsWithdrawn(id, c.owner, amount);
    }
 
    /// @notice Refund caller’s contribution if campaign failed after deadline
    function refund(uint id) external campaignExists(id) nonReentrant {
        Campaign storage c = campaigns[id];
        require(block.timestamp >= c.deadline, "Too early");
        require(!c.goalReached, "Campaign succeeded");
 
        uint bal = contributions[id][msg.sender];
        require(bal > 0, "Nothing to refund");
 
        contributions[id][msg.sender] = 0; // effects
        c.liveBalance -= bal;
 
        (bool ok, ) = payable(msg.sender).call{value: bal}("");
        require(ok, "Refund failed");
 
        emit Refunded(id, msg.sender, bal);
    }
 
    // --- Convenience views ---
    function getTimeLeft(uint id) external view campaignExists(id) returns (uint) {
        Campaign storage c = campaigns[id];
        if (block.timestamp >= c.deadline) return 0;
        return c.deadline - block.timestamp;
    }
 
    function getCampaignBalance(uint id) external view campaignExists(id) returns (uint) {
        return campaigns[id].liveBalance;
    }
 
    // Block accidental direct sends
    receive() external payable { revert("Use donateTo"); }
    fallback() external payable { revert("Use donateTo"); }
}
 