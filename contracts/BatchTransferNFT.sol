// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract BatchTransferNFT is Ownable2Step {
    IERC721 public immutable erc721Token;
    uint256 public immutable maxBatchSize;

    error InvalidRange();
    error BatchSizeExceeded();
    error TokenOwnershipError(uint256 tokenId, address expectedOwner, address actualOwner);

    event BatchTransfer(address indexed from, address indexed to, uint256 startSRNumber, uint256 endSRNumber);

    constructor(address _erc721TokenAddress, uint256 _maxBatchSize) Ownable(msg.sender) {
        erc721Token = IERC721(_erc721TokenAddress);
        maxBatchSize = _maxBatchSize;
    }

    // Function to batch transfer ERC-721 tokens with a limit on the batch size
    function batchTransferERC721(
        address from,
        address to,
        uint256 startSRNumber,
        uint256 endSRNumber
    ) external onlyOwner {
        // Validate range
        if (startSRNumber > endSRNumber) {
            revert InvalidRange();
        }

        // Validate batch size
        uint256 batchSize = endSRNumber - startSRNumber + 1;
        if (batchSize > maxBatchSize) {
            revert BatchSizeExceeded();
        }

        IERC721 token = erc721Token; // Local variable to save gas

        // Loop to validate ownership and perform transfers
        for (uint256 i = startSRNumber; i <= endSRNumber; ) {
            address currentOwner = token.ownerOf(i);
            if (currentOwner != from) {
                revert TokenOwnershipError(i, from, currentOwner);
            }
            token.safeTransferFrom(from, to, i);
            unchecked { ++i; }
        }

        emit BatchTransfer(from, to, startSRNumber, endSRNumber);
    }

    // Function to get missing tokens in the specified range
    function getMissingTokens(
        address from,
        uint256 startSRNumber,
        uint256 endSRNumber
    ) external view returns (uint256[] memory missingTokens) {
        IERC721 token = erc721Token; // Local variable to save gas
        uint256 missingCount = 0;

        // Count missing tokens first to set array size
        for (uint256 i = startSRNumber; i <= endSRNumber; ) {
            if (token.ownerOf(i) != from) {
                ++missingCount;
            }
            unchecked { ++i; }
        }

        // Populate the array with missing tokens
        missingTokens = new uint256[](missingCount);
        uint256 index = 0;
        for (uint256 i = startSRNumber; i <= endSRNumber; ) {
            if (token.ownerOf(i) != from) {
                missingTokens[index] = i;
                ++index;
            }
            unchecked { ++i; }
        }
    }
}
