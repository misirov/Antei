//SPDX-License-Identifier: Unlicense
pragma solidity >0.8.0;

import "./utils/ERC20.sol";

contract Vault is ERC20 {
    error notAuthorized();
  
    event stratTransfer(address _strategy, uint tokenBalance);
    event deposit(address sender, uint value);
    event redeemed(address _owner, uint _amount);

    mapping(address => bool) public authorized;
    mapping(address => uint) public userToBalance;
    mapping(address => uint) public userToTimestamp;

    address public owner;

    constructor()ERC20("Antei Farm Token", "ANTEI"){
        authorized[msg.sender] = true;
        owner = msg.sender;
    }

    modifier onlyAuthorized {
        if(authorized[msg.sender] != true) revert notAuthorized();
        _;
    }

    function vaultBalance() public view returns(uint){
        return address(this).balance;
    }

    function userBalance() public view returns(uint){
        return userToBalance[msg.sender];
    }

    function userTimestamp() public view returns(uint){
        return userToTimestamp[msg.sender];
    }


    function calculateRewards(address _user) public view returns(uint){
        uint startTime = userToTimestamp[_user];
        uint currentTime = block.timestamp;
        uint difference = currentTime - startTime;
        uint reward = difference;
        return reward;
    }


    // handle ETH deposits
    // mints $ANTEI 1:1 to user
    function depositETH() external payable returns(bool){
        require(msg.value > 0, "ERROR_MUST_DEPOSIT_SOMETHING");
        userToBalance[msg.sender] += msg.value;
        _mint(msg.sender, msg.value);        
        userToTimestamp[msg.sender] = block.timestamp;
        emit deposit(msg.sender, msg.value);
        return true;
    }


    // redeem + rewards
    function redeem(uint _amount) external returns(bool){
        require(_amount > 0, "AMOUNT < 0");
        uint balance = userBalance();
        require(balance >= _amount, "NOT ENOUGH BALANCE");
        uint finalAmount = balance - _amount;
        userToBalance[msg.sender] = finalAmount;
        _burn(msg.sender, _amount);
        userToTimestamp[msg.sender] = 0;
        uint reward = calculateRewards(msg.sender);
        uint adjustedAmount = _amount + reward;
        if(adjustedAmount > address(this).balance){
            // allow user to remove only his funds without reward
            (bool s, bytes memory d) = msg.sender.call{value:_amount}("");
            require(s, "ERROR_WITHDRAWING_ETH");
            emit redeemed(msg.sender,  _amount);
            return true;
        }
        (bool s, bytes memory d) = msg.sender.call{value:adjustedAmount}("");
        require(s, "ERROR_WITHDRAWING_ETH");
        emit redeemed(msg.sender,  adjustedAmount);
        return true;
    }


    function addAuthorized(address _user) external onlyAuthorized {
        authorized[_user] =  true;
    }

    function removeAllFunds() external onlyAuthorized {
        require(authorized[msg.sender] = true, "NOT_AUTHORIZED");
        (bool s, ) = msg.sender.call{value: address(this).balance}(""); 
        require(s, "REMOVE_FUNDS_ERROR");
    }


}