// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title UniversityVoting - Multi-position university election system
/// @notice Supports multiple elections, positions, and candidate verification with role-gated admin
contract UniversityVoting is Ownable {
    struct Position {
        uint256 id;
        string title;
        string requirements; // Free-form requirements description
    }

    struct Candidate {
        uint256 id;
        address studentWallet;
        string name;
        uint256 positionId; // Position within the election
        uint256 voteCount;
        bool verified;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        // Positions
        uint256[] positionIds;
        mapping(uint256 => Position) positions; // positionId => Position
        // Candidates
        uint256[] candidateIds;
        mapping(uint256 => Candidate) candidates; // candidateId => Candidate
        // Voting
        mapping(address => mapping(uint256 => bool)) hasVotedForPosition; // voter => positionId => voted
        mapping(address => bool) whitelistedVoter; // voter eligibility per election
        bool exists;
    }

    // Elections
    uint256 public nextElectionId = 1;
    uint256 public nextCandidateId = 1;
    uint256 public nextPositionId = 1;
    mapping(uint256 => Election) private elections; // electionId => Election

    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        uint256 indexed positionId,
        address studentWallet,
        string name
    );
    event CandidateVerified(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        bool verified
    );
    event VoteCast(
        uint256 indexed electionId,
        uint256 indexed positionId,
        uint256 indexed candidateId,
        address voter
    );
    event VoterWhitelisted(uint256 indexed electionId, address indexed voter);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    // Admin functions
    function createElection(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        Position[] memory initialPositions
    ) external onlyOwner returns (uint256 electionId) {
        require(bytes(title).length > 0, "Title required");
        require(endTime > startTime && endTime > block.timestamp, "Invalid timeframe");
        require(startTime >= block.timestamp, "Start time in past");
        require(initialPositions.length > 0, "No positions");

        electionId = nextElectionId++;
        Election storage e = elections[electionId];
        e.id = electionId;
        e.title = title;
        e.description = description;
        e.startTime = startTime;
        e.endTime = endTime;
        e.exists = true;

        for (uint256 i = 0; i < initialPositions.length; i++) {
            uint256 pid = nextPositionId++;
            e.positions[pid] = Position({id: pid, title: initialPositions[i].title, requirements: initialPositions[i].requirements});
            e.positionIds.push(pid);
        }

        emit ElectionCreated(electionId, title, startTime, endTime);
    }

    function addCandidate(
        uint256 electionId,
        uint256 positionId,
        address studentWallet,
        string memory name
    ) external onlyOwner returns (uint256 candidateId) {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        require(block.timestamp < e.endTime, "Election ended");
        require(e.positions[positionId].id != 0, "Position not found");
        require(studentWallet != address(0), "Invalid wallet");
        require(bytes(name).length > 0, "Name required");

        candidateId = nextCandidateId++;
        e.candidates[candidateId] = Candidate({
            id: candidateId,
            studentWallet: studentWallet,
            name: name,
            positionId: positionId,
            voteCount: 0,
            verified: false
        });
        e.candidateIds.push(candidateId);

        emit CandidateAdded(electionId, candidateId, positionId, studentWallet, name);
    }

    function verifyCandidate(uint256 electionId, uint256 candidateId) external onlyOwner {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        Candidate storage c = e.candidates[candidateId];
        require(c.id != 0, "Candidate not found");
        c.verified = true;
        emit CandidateVerified(electionId, candidateId, true);
    }

    function whitelistVoter(uint256 electionId, address voter) external onlyOwner {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        require(voter != address(0), "Invalid voter");
        e.whitelistedVoter[voter] = true;
        emit VoterWhitelisted(electionId, voter);
    }

    // Voting
    function castVote(
        uint256 electionId,
        uint256 positionId,
        uint256 candidateId
    ) external {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        require(block.timestamp >= e.startTime && block.timestamp <= e.endTime, "Out of window");
        require(e.whitelistedVoter[msg.sender], "Not eligible");
        require(!e.hasVotedForPosition[msg.sender][positionId], "Already voted");
        Candidate storage c = e.candidates[candidateId];
        require(c.id != 0 && c.positionId == positionId, "Invalid candidate");
        require(c.verified, "Candidate not verified");

        c.voteCount += 1;
        e.hasVotedForPosition[msg.sender][positionId] = true;
        emit VoteCast(electionId, positionId, candidateId, msg.sender);
    }

    // Views
    function getElection(uint256 electionId)
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256[] memory positionIds,
            uint256[] memory candidateIds
        )
    {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        return (e.title, e.description, e.startTime, e.endTime, e.positionIds, e.candidateIds);
    }

    function getPosition(uint256 electionId, uint256 positionId)
        external
        view
        returns (Position memory)
    {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        Position memory p = e.positions[positionId];
        require(p.id != 0, "Position not found");
        return p;
    }

    function getCandidate(uint256 electionId, uint256 candidateId)
        external
        view
        returns (Candidate memory)
    {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        Candidate memory c = e.candidates[candidateId];
        require(c.id != 0, "Candidate not found");
        return c;
    }

    function hasVoted(address voter, uint256 electionId, uint256 positionId) external view returns (bool) {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        return e.hasVotedForPosition[voter][positionId];
    }

    function getElectionResults(uint256 electionId)
        external
        view
        returns (uint256[] memory candidateIds, uint256[] memory voteCounts)
    {
        Election storage e = elections[electionId];
        require(e.exists, "Election not found");
        uint256 len = e.candidateIds.length;
        candidateIds = new uint256[](len);
        voteCounts = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            uint256 cid = e.candidateIds[i];
            candidateIds[i] = cid;
            voteCounts[i] = e.candidates[cid].voteCount;
        }
    }
}