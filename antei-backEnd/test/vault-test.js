const { ethers } = require("hardhat");

describe("Vault", function () {
  it("", async function () {
    var Vault = await hre.ethers.getContractFactory("Vault");
    var vault = await Vault.deploy();
    await vault.deployed();
    console.log("Vault deployed to:", vault.address);


    // ------------ Uncomment only to test against deployed contract ----------------------
    // const [signer] = await ethers.getSigners();
    // vault_address = "CHANGE ADDRESS";
    // abi =
    //  ["function depositETH() external payable",
    //  "function redeem(uint amunt) external",
    //  "function userBalance() public view returns(uint256)",
    //  "function vaultBalance() public view returns(uint256)",
    //  "function userTimestamp() public view returns(uint256)"
    // ]
    // const vault = new ethers.Contract(vault_address,abi, signer)
    // ------------------------ ------------ ------------------------------------



    amount = "5";
    parsed_amount = ethers.utils.parseEther(amount);

    // deposit eth
    tx = await vault.depositETH({value: parsed_amount})
    tt = await vault.userBalance();
    console.log(`Depositing ETH...\nUser balance in vault: ${tt.toString() / 10**18} ETH`);
    vb = await vault.vaultBalance();
    console.log(`Vault balance: ${vb.toString()} wei\n`)


    // withdraw eth
    tx2 = await vault.redeem(parsed_amount)
    tt = await vault.userBalance();
    console.log(`Redeeming ETH...\nUser balance in vault: ${tt.toString() / 10**18} ETH`);
    vb = await vault.vaultBalance();
    console.log(`Vault balance: ${vb.toString()} wei\n`)


    // CALCULATE REWARDS BASED ON TIMESTAMPS
    console.log('Calculating rewards based on timestamps (not for production)')
    provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    currentBlock = await provider.getBlock()
    console.log(`Current block timestamp: ${currentBlock.timestamp}`)

    userTimestamp = await vault.userTimestamp()
    console.log(`User timestamp: ${userTimestamp.toString()}`)

    rewards = currentBlock.timestamp - userTimestamp
    console.log(`Difference: ${rewards}`)

  });
});
