# NFT Batch Transfer

ERC 721 Batch sender in BSC Testnet. This package is created with hardhat and importing openzeppelin libraries and ethers v6. Wrote contracts, scripts for deploy and unit testing functionalities.

## Steps to clone

1. Clone the repo - https://github.com/0xthi/nft-batch-transfer

2. Run `npm i` to install all the required packages.

3. Set .env by referring example.env.

4. Compile and run contracts with `npx hardhat compile`

5. After successful compilation, test contracts with `npx hardhat test`

6. For deployment `npx hardhat run scripts/deploy.js --network bsctest`

7. Verify the contracts with `npx hardhat verify <YOUR_CONTRACT_ADDR> --network bsctest <CONSTRUCTOR_ARGS>`


### Deployed code

Batch Transfer NFT : https://testnet.bscscan.com/address/0x8FA5cb3c2703052cEEe771cB6cB3c96793E7bD89#code

Test NFT : https://testnet.bscscan.com/address/0x63A3d8a47A22f830336Fd5e860747cba1a45E42E#code

Batch NFT Tx hash : https://testnet.bscscan.com/tx/0xae8479a5917186b6ebb3b8f3d7d4fad229e64240ac0dd9415558845fe7255ddc