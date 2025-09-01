// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Poll {
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        mapping(address => bool) hasVoted;
        bool active;
        uint256 startTime;
        uint256 endTime;
    }

    Poll[] public polls;
    mapping(address => bool) public whitelistedVoters;

    event PollCreated(uint256 indexed pollId, string question, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed pollId, uint256 indexed option, address indexed voter);
    event PollEnded(uint256 indexed pollId);
    event VoterWhitelisted(address indexed voter);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    function whitelistVoter(address voter) external onlyOwner {
        require(voter != address(0), "Invalid address");
        whitelistedVoters[voter] = true;
        emit VoterWhitelisted(voter);
    }

    function createPoll(
        string memory question,
        string[] memory options,
        uint256 durationSeconds
    ) external onlyOwner {
        require(options.length > 1, "At least two options required");

        uint256 start = block.timestamp;
        uint256 end = start + durationSeconds;

        Poll storage newPoll = polls.push();
        newPoll.question = question;
        newPoll.options = options;
        newPoll.active = true;
        newPoll.startTime = start;
        newPoll.endTime = end;

        emit PollCreated(polls.length - 1, question, start, end);
    }

    function vote(uint256 pollId, uint256 option) external {
        require(pollId < polls.length, "Invalid poll");
        Poll storage poll = polls[pollId];
        require(poll.active, "Poll is not active");
        require(block.timestamp >= poll.startTime && block.timestamp <= poll.endTime, "Poll time invalid");
        require(whitelistedVoters[msg.sender], "Not whitelisted");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(option < poll.options.length, "Invalid option");

        poll.votes[option] += 1;
        poll.hasVoted[msg.sender] = true;
        emit VoteCast(pollId, option, msg.sender);
    }

    function endPoll(uint256 pollId) external onlyOwner {
        require(pollId < polls.length, "Invalid poll");
        Poll storage poll = polls[pollId];
        require(poll.active, "Poll already ended");
        poll.active = false;
        emit PollEnded(pollId);
    }

    function getPollResults(uint256 pollId) external view returns (uint256[] memory) {
        require(pollId < polls.length, "Invalid poll");
        Poll storage poll = polls[pollId];
        require(!poll.active, "Poll must be ended to view results");

        uint256[] memory results = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }
        return results;
    }
}
