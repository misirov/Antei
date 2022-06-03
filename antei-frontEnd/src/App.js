import React, { useEffect, useState } from 'react';
import {ethers} from "ethers";


import VAULT from "./utils/Vault.json";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import arrow from "./assets/arrow.svg"
import Loading from './Components/Loading';
import Withdrawing from "./Components/Withdrawing";
import VaultInformation from "./Components/VaultInformation";

// Constants
const contractAddress = "0xF3FEA28366aB5D98Fb2694b21f127E9a615Fb13E";
const TWITTER_HANDLE = 'p_misirov';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isWithdrawing, setWithdrawing] = useState(false);
  const [isReceipt, setReceipt] = useState("");
  const [amount, setAmount] = useState('')
  const [maxUserBalance, setMaxUserBalance] = useState('')
  
 
  // Is the wallet connected? metamask injects the "ethereum" object
  const walletConnected = async () =>{
    const {ethereum} = window;
    if(!ethereum){
      console.log("Please download metamask");
      return;
    
    } else{
      console.log("Ethereum object found", ethereum);
    }

    // Get chain ID, trhow alert if not connected to Rinkeby
    chainID();

    //If site already connnected to metamask, get user public key
    const accounts = await ethereum.request({method: 'eth_accounts'})

    if(accounts.length !== 0){
      const account = accounts[0];
      console.log(`User account: ${account}`);

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      eventListener();

    } else {
      console.log("Site is not authorized to access metamask")
    }

  }


// Function to connect site to the metamask wallet
  const connectWallet = async () => {
    const {ethereum} = window;
    try{
      if(!ethereum){
        alert("Please download metamask!");
        return;
      }
      // Connect to metamask wallet
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log(`connected: ${accounts[0]}`)
      setCurrentAccount(accounts[0]);
      eventListener()
    
    } catch (e){
      console.log(e)
    }
  }


  // function that listens for smart contract events
  const eventListener = async () => {
    const {ethereum} = window;
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract
        (
          contractAddress, 
          VAULT.abi, 
          signer
        );
        // webhook, listening for smart contract events
        const event_name = "deposit";
        contract.on(event_name, (from, amount) => {
          console.log(`From: ${from} , amount: ${amount}`)
          var hash = amount.toNumber();
          //setHash(id)
          
        })
      }
      console.log("Setup event listener!")
    
    } catch(e){
      console.log(e);
    }
  }


  // Get user's current chain ID 
  const chainID = async () => {
    const {ethereum} = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);
    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }


  // Deposit ETH in VAULT and get tx hash
  const depositETH = async () => {
    const {ethereum} = window;
    try{
      if(ethereum){
        chainID();
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, VAULT.abi, signer);

        // pop wallet to pay gas. Parse user input into ETH and deposit
        var deposit_eth = ethers.utils.parseEther(amount).toString();
        let tx = await contract.depositETH({value:deposit_eth});
        setLoading(true)
        
        await tx.wait();
        
        console.log(`Transaction mined at https://rinkeby.etherscan.io/tx/${tx.hash}`);
        const hash = tx.hash;

        setReceipt(hash)
        setLoading(false)
      }
      setLoading(false)
    
    } catch(e){
      setLoading(false)
      console.log(e)
    }
  }


  // Redeem ETH from VAULT + rewards and get tx hash
  const redeemETH = async () => {
    const {ethereum} = window;
    try{
      if(ethereum){
        chainID();
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, VAULT.abi, signer);

        // pop wallet to pay gas. Parse user input into ETH and withdraw @param not payable
        var withdraw_eth = ethers.utils.parseEther(amount).toString();
        let tx = await contract.redeem(withdraw_eth);
        setWithdrawing(true)
        
        await tx.wait();
        console.log(`Transaction mined at https://rinkeby.etherscan.io/tx/${tx.hash}`);
        const hash = tx.hash;

        setReceipt(hash)
        setWithdrawing(false)
      }

      setWithdrawing(false)

    } catch(e){
      setWithdrawing(false)
      console.log(e)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect Wallet
    </button>
  );


  // runs when page loads
  useEffect(() => {
    walletConnected();
  }, []);



  // when user is depositing funds and waiting for TX to pass:
  if(isLoading){
    return(
      <main>
          <Loading />     
      </main>
    )
  }


  return (
    <div className="App">
      <div className="container">

        <div className="header-container">
          <p className="header gradient-text">Antei</p>
          <p className="sub-text">Yield Aggregator.</p>

          <VaultInformation/>

          {/*IF wallet NOT connected, RENDER renderNotConnectedContainer, ELSE RENDER input and buttons*/}
          {currentAccount === "" ? renderNotConnectedContainer() : (
          <>
            <input className='user-input' type="text" placeholder='enter amount'  onChange={event => setAmount(event.target.value)}/> 
            <br/>
            <button onClick={redeemETH} className="cta-button withdraw-button">Withdraw ETH</button>
            <button onClick={depositETH} className="cta-button deposit-button">Deposit ETH</button>
          </>
          )}

          {/* Start function: if isReceipt is empty, then render nothing. Else when receipt has the hash inside, render a whole container with info inside */}
          {isReceipt === "" ? 
            <div className="receipt">
              <h1></h1>
            </div>
          : (
            <div className="event-container">
              <h3>Your receipt:</h3>
              <div className="receipt">
                <a href={`https://rinkeby.etherscan.io/tx/${isReceipt}`}>View transaction on Etherscan <img src={arrow} className="svg" target="_blank" /> </a>
              </div>
            </div>
          )}
          {/* end function */}

        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer"> {`@${TWITTER_HANDLE}`}</a>

        </div>

      </div>
    </div>
  );
  


  

};

export default App;
