// Import necessary modules
const { ethers } = require("hardhat");

async function main() {
    // Get the contract factory for TestNFT
    const TestNFT = await ethers.getContractFactory("TestNFT");

    // Deploy TestNFT contract
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment(); // Wait for deployment to complete
    console.log("TestNFT deployed to:", await testNFT.getAddress()); // Get the deployed contract address

    // Get the contract factory for BatchTransferNFT
    const BatchTransferNFT = await ethers.getContractFactory("BatchTransferNFT");

    // Define the maximum batch size
    const maxBatchSize = 5;

    // Deploy BatchTransferNFT contract, passing the TestNFT address and maxBatchSize
    const batchTransferNFT = await BatchTransferNFT.deploy(await testNFT.getAddress(), maxBatchSize);
    await batchTransferNFT.waitForDeployment(); // Wait for deployment to complete
    console.log("BatchTransferNFT deployed to:", await batchTransferNFT.getAddress()); // Get the deployed contract address
}

// Execute the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
