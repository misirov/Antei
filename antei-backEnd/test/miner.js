const { ethers } = require("hardhat");
const hre = require("hardhat");

/// Pass argument to script. Ex:
///     $ node ./MinerOnOff.js on
///     $ node ./MinerOnOff.js off

const miner = async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    const myArgs = process.argv.slice(2);
    
    if(myArgs[0] === 'off'){
        console.log("Turning OFF miner...\n")
        await provider.send("evm_setIntervalMining", [0]);
    
    } else if(myArgs[0] === 'on') {
        console.log('Turning ON, mining block every 5 seconds...')
        await provider.send("evm_setIntervalMining", [5000]);

    } else {
        console.log("please pass 'on' OR 'off' OR 'interval' as an argument\n")
        return 1;
    }
}

miner()