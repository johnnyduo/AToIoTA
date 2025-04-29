// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AutomatedPortfolio
 * @dev A smart contract for managing portfolio allocations across different asset categories
 */
contract AutomatedPortfolio {
    address public owner;
    
    struct Allocation {
        string category;
        uint256 percentage;
    }
    
    Allocation[] public allocations;
    
    event AllocationUpdated(string category, uint256 oldPercentage, uint256 newPercentage);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "AutomatedPortfolio: caller is not the owner");
        _;
    }
    
    /**
     * @dev Constructor sets the original owner of the contract and initializes default allocations
     */
    constructor() {
        owner = msg.sender;
        
        // Initialize with default allocations
        allocations.push(Allocation("ai", 15));
        allocations.push(Allocation("meme", 10));
        allocations.push(Allocation("rwa", 15));
        allocations.push(Allocation("bigcap", 25));
        allocations.push(Allocation("defi", 15));
        allocations.push(Allocation("l1", 15));
        allocations.push(Allocation("stablecoin", 5));
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "AutomatedPortfolio: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Updates the portfolio allocations
     * @param categories Array of category names
     * @param percentages Array of allocation percentages
     */
    function updateAllocations(
        string[] memory categories,
        uint256[] memory percentages
    ) public onlyOwner {
        require(categories.length == percentages.length, "AutomatedPortfolio: arrays must be same length");
        
        uint256 total = 0;
        for (uint i = 0; i < percentages.length; i++) {
            total += percentages[i];
        }
        
        require(total == 100, "AutomatedPortfolio: total allocation must be 100%");
        
        // Update allocations
        for (uint i = 0; i < categories.length; i++) {
            bool found = false;
            
            for (uint j = 0; j < allocations.length; j++) {
                if (keccak256(bytes(allocations[j].category)) == keccak256(bytes(categories[i]))) {
                    uint256 oldPercentage = allocations[j].percentage;
                    allocations[j].percentage = percentages[i];
                    emit AllocationUpdated(categories[i], oldPercentage, percentages[i]);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                allocations.push(Allocation(categories[i], percentages[i]));
                emit AllocationUpdated(categories[i], 0, percentages[i]);
            }
        }
        
        // Remove any categories that are no longer in the allocation
        for (uint i = 0; i < allocations.length; i++) {
            bool found = false;
            
            for (uint j = 0; j < categories.length; j++) {
                if (keccak256(bytes(allocations[i].category)) == keccak256(bytes(categories[j]))) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                emit AllocationUpdated(allocations[i].category, allocations[i].percentage, 0);
                
                // Remove by swapping with the last element and then removing the last element
                allocations[i] = allocations[allocations.length - 1];
                allocations.pop();
                
                // Adjust the loop counter since we've modified the array
                i--;
            }
        }
    }
    
    /**
     * @dev Gets all current allocations
     * @return Two arrays: categories and their corresponding percentages
     */
    function getAllocations() public view returns (string[] memory, uint256[] memory) {
        string[] memory categories = new string[](allocations.length);
        uint256[] memory percentages = new uint256[](allocations.length);
        
        for (uint i = 0; i < allocations.length; i++) {
            categories[i] = allocations[i].category;
            percentages[i] = allocations[i].percentage;
        }
        
        return (categories, percentages);
    }
    
    /**
     * @dev Gets the number of allocation categories
     * @return The number of categories
     */
    function getAllocationCount() public view returns (uint256) {
        return allocations.length;
    }
}