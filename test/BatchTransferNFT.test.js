const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatchNFT", function () {
    let BatchNFT, batchNFT, TestNFT, testNFT, owner, addr1, addr2;

    beforeEach(async function () {
        // Get the contract factories
        BatchNFT = await ethers.getContractFactory("BatchTransferNFT");
        TestNFT = await ethers.getContractFactory("TestNFT");

        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy TestNFT contract
        testNFT = await TestNFT.deploy(); // No need for await testNFT.deployed();

        // Deploy BatchNFT contract with the address of TestNFT and max batch size
        batchNFT = await BatchNFT.deploy(await testNFT.getAddress(), 5); // Use getAddress()
    });

    it("Should set the right owner", async function () {
        expect(await batchNFT.owner()).to.equal(await owner.getAddress()); // Use getAddress()
    });

    it("Should mint and transfer all NFTs in batch", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Approve BatchNFT to transfer all tokens on behalf of owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.connect(owner).approve(batchNFT.getAddress(), i); // Approve each token
        }

        // Check ownership before batch transfer
        for (let i = 1; i <= 5; i++) {
            expect(await testNFT.ownerOf(i)).to.equal(await owner.getAddress()); // Use getAddress()
        }

        // Batch transfer all tokens from owner to addr2
        await expect(batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 5)) // Use getAddress()
            .to.emit(batchNFT, "BatchTransfer")
            .withArgs(await owner.getAddress(), await addr2.getAddress(), 1, 5); // Use getAddress()

        // Check ownership after batch transfer
        for (let i = 1; i <= 5; i++) {
            expect(await testNFT.ownerOf(i)).to.equal(await addr2.getAddress()); // Use getAddress()
        }
    });

    it("Should revert if a token is not owned by the from address", async function () {
        // Mint tokens to owner
        await testNFT.mint(await owner.getAddress()); // Use getAddress()
        await testNFT.mint(await owner.getAddress()); // Use getAddress()

        // Transfer token 2 to addr1
        await testNFT.safeTransferFrom(await owner.getAddress(), await addr1.getAddress(), 2); // Use getAddress()

        // Approve BatchNFT to transfer tokens on behalf of owner
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 1); // Approve token 1

        // Attempt to batch transfer with one token not owned by owner
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 2) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "TokenOwnershipError");
    });

    it("Should revert if a token is not owned by the from address during batch transfer", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Approve BatchNFT to transfer tokens on behalf of owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.connect(owner).approve(batchNFT.getAddress(), i); // Approve each token
        }

        // Transfer ownership of token 2 to addr1
        await testNFT.safeTransferFrom(await owner.getAddress(), await addr1.getAddress(), 2); // Use getAddress()

        // Check ownership before batch transfer
        expect(await testNFT.ownerOf(1)).to.equal(await owner.getAddress()); // Use getAddress()
        expect(await testNFT.ownerOf(2)).to.equal(await addr1.getAddress()); // Use getAddress()

        // Attempt to batch transfer tokens 1, 2, and 3 from owner to addr2
        // This should revert because token 2 is not owned by the owner anymore
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 3) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "TokenOwnershipError");
    });

    it("Should return missing tokens correctly", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Transfer token 2 and 4 to addr1
        await testNFT.safeTransferFrom(await owner.getAddress(), await addr1.getAddress(), 2); // Use getAddress()
        await testNFT.safeTransferFrom(await owner.getAddress(), await addr1.getAddress(), 4); // Use getAddress()

        // Call getMissingTokens and check result
        const missingTokens = await batchNFT.getMissingTokens(await owner.getAddress(), 1, 5); // Use getAddress()
        expect(missingTokens).to.deep.equal([2, 4]);
    });

    it("Should emit the correct event for batch transfer", async function () {
        // Mint tokens and batch transfer
        await testNFT.mint(await owner.getAddress()); // Use getAddress()
        await testNFT.mint(await owner.getAddress()); // Use getAddress()
        await testNFT.mint(await owner.getAddress()); // Use getAddress();

        // Approve BatchNFT to transfer tokens on behalf of owner
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 1); // Approve token 1
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 2); // Approve token 2
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 3); // Approve token 3

        await expect(batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 3)) // Use getAddress()
            .to.emit(batchNFT, "BatchTransfer")
            .withArgs(await owner.getAddress(), await addr2.getAddress(), 1, 3); // Use getAddress()
    });

    it("Should revert if startSRNumber > endSRNumber", async function () {
        // Mint tokens
        await testNFT.mint(await owner.getAddress()); // Use getAddress()
        await testNFT.mint(await owner.getAddress()); // Use getAddress()

        // Approve BatchNFT to transfer tokens on behalf of owner
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 1); // Approve token 1

        // Call with invalid range
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 3, 1) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "InvalidRange");
    });

    it("Should revert if batch size exceeds the maxBatchSize", async function () {
        // Mint tokens
        for (let i = 1; i <= 6; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Approve BatchNFT to transfer tokens on behalf of owner
        for (let i = 1; i <= 6; i++) {
            await testNFT.connect(owner).approve(batchNFT.getAddress(), i); // Approve each token
        }

        // Call with batch size exceeding maxBatchSize (5)
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 6) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "BatchSizeExceeded");
    });

    it("Should handle maximum batch size correctly", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Approve BatchNFT to transfer tokens on behalf of owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.connect(owner).approve(batchNFT.getAddress(), i); // Approve each token
        }

        // Batch transfer exactly maxBatchSize tokens from owner to addr2
        await expect(batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 5)) // Use getAddress()
            .to.emit(batchNFT, "BatchTransfer")
            .withArgs(await owner.getAddress(), await addr2.getAddress(), 1, 5); // Use getAddress()
    });

    it("Should revert if batch transfer is called with an empty range", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }

        // Attempt to batch transfer with an empty range
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 0) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "InvalidRange");
    });

    it("Should revert if some tokens in the range are not owned by the from address", async function () {
        // Mint tokens to owner
        for (let i = 1; i <= 5; i++) {
            await testNFT.mint(await owner.getAddress()); // Use getAddress()
        }
    
        // Transfer token 2 to addr1
        await testNFT.safeTransferFrom(await owner.getAddress(), await addr1.getAddress(), 2); // Use getAddress()
    
        // Approve only the tokens that are still owned by the owner
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 1); // Approve token 1
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 3); // Approve token 3
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 4); // Approve token 4
        await testNFT.connect(owner).approve(batchNFT.getAddress(), 5); // Approve token 5
    
        // Attempt to batch transfer tokens 1, 2, and 3 from owner to addr2
        await expect(
            batchNFT.batchTransferERC721(await owner.getAddress(), await addr2.getAddress(), 1, 3) // Use getAddress()
        ).to.be.revertedWithCustomError(batchNFT, "TokenOwnershipError");
    });
});