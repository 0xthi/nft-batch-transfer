// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721, Ownable {
    uint256 public currentTokenId;

    constructor() ERC721("TestERC721", "TEST") Ownable(msg.sender) {}

    function mint(address to) external onlyOwner {
        currentTokenId++;
        _mint(to, currentTokenId);
    }
}
