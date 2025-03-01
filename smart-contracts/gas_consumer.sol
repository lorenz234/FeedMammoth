// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for ERC20 token
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BestHashGame {
    address public owner;
    address public bestUser;
    bytes32 public bestHash = bytes32(type(uint256).max); // Initialize with the highest value
    IERC20 public xpToken;

    uint256 public indexCounter;
    mapping(address => uint256) public indexUser;
    mapping(uint256 => UserStats) public userStats;
    uint256 public totalUserCalls;

    struct UserStats {
        address user;
        bytes32 bestHash;
        uint256 numCalls;
    }

    event HashUpdated(address indexed user, bytes32 newHash);
    event RoundFinished(address winner, bytes32 winningHash, uint256 xpReward, uint256 totalCalls, uint256 numCalls);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _xpToken) {
        owner = msg.sender;
        xpToken = IERC20(_xpToken);
    }

    function countLeadingZeros(bytes32 hash) public pure returns (uint256) {
        uint256 value = uint256(hash);
        uint256 zeros = 0;

        for (uint256 i = 255; i >= 0; i--) {
            if ((value & (1 << i)) != 0) {
                break;
            }
            zeros++;
        }

        return zeros / 4;
    }

    function feed_mammoth() external {
        uint256 nonce = uint256(uint160(msg.sender));
        bytes32 newHash = keccak256(abi.encodePacked(nonce, blockhash(block.number - 1), msg.sender));

        if (indexUser[msg.sender] == 0) {
            indexCounter++;
            indexUser[msg.sender] = indexCounter;
        }

        uint256 userIndex = indexUser[msg.sender];
        userStats[userIndex].user = msg.sender;
        userStats[userIndex].numCalls++;
        totalUserCalls++;

        if (userStats[userIndex].bestHash == bytes32(0) || newHash < userStats[userIndex].bestHash) {
            userStats[userIndex].bestHash = newHash;
            emit HashUpdated(msg.sender, newHash);
        }

        if (newHash < bestHash) {
            bestHash = newHash;
            bestUser = msg.sender;
        }
    }

    function finish_round() external onlyOwner {
        require(bestUser != address(0), "No valid winner found");

        address winningUser = bestUser;
        bytes32 winningHash = bestHash;

        uint256 leadingZeros = countLeadingZeros(winningHash);
        uint256 xpReward = 10 ** (leadingZeros + 18);

        uint256 contractBalance = xpToken.balanceOf(address(this));
        xpReward = xpReward > contractBalance ? contractBalance : xpReward;

        if (xpReward > 0 && contractBalance >= xpReward) {
            require(xpToken.transfer(winningUser, xpReward), "XP transfer failed");
        }

        emit RoundFinished(winningUser, winningHash, xpReward, totalUserCalls, userStats[indexUser[winningUser]].numCalls);

        bestHash = bytes32(type(uint256).max);
        bestUser = address(0);
        totalUserCalls = 0;

        for (uint256 i = 1; i <= indexCounter; i++) {
            address user = userStats[i].user;
            indexUser[user] = 0;
            userStats[i] = UserStats(address(0), bytes32(0), 0);
        }
    
        indexCounter = 0;
    }

    function emergencyWithdrawXP() external onlyOwner {
        uint256 balance = xpToken.balanceOf(address(this));
        require(balance > 0, "No XP tokens to withdraw");
        require(xpToken.transfer(owner, balance), "XP transfer failed");
    }

    function setXPToken(address _newXPToken) external onlyOwner {
        require(_newXPToken != address(0), "Invalid token address");
        xpToken = IERC20(_newXPToken);
    }
}
