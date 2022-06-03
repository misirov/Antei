//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IERC20 {
    function approve(address, uint256) external returns(bool);
    function transfer(address, uint256) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IScream {
    function mint(uint256) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
    function supplyRatePerBlock() external returns (uint256);
    function redeem(uint) external returns (uint);
    function redeemUnderlying(uint) external returns (uint);
    
    /**
     * @notice Get a snapshot of the account's balances, and the cached exchange rate
     * @dev This is used by comptroller to more efficiently perform liquidity checks.
     * @param account Address of the account to snapshot
     * @return (possible error, token balance, borrow balance, exchange rate mantissa) https://compound.finance/docs/comptroller#account-liquidity
    */
    function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint); // getAccountLiquidity(?)

    /**
     * @notice Sender borrows assets from the protocol to their own address
     * @param borrowAmount The amount of the underlying asset to borrow
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details) https://compound.finance/docs/comptroller#error-codes
    */
    function borrow(uint256 borrowAmount) external returns(uint);

    /**
     * @notice Accrue interest to updated borrowIndex and then calculate account's borrow balance using the updated borrowIndex
     * @param account The address whose balance should be calculated after updating borrowIndex
     * @return The calculated balance
     */
    function borrowBalanceCurrent(address account) external returns (uint);
}


interface IComptroller {
    /*** Assets You Are In ***/
    function enterMarkets(address[] calldata cTokens) external returns (uint[] memory);
    function exitMarket(address cToken) external returns (uint);

    /*** Policy Hooks ***/
    function mintAllowed(address cToken, address minter, uint mintAmount) external returns (uint);
    function mintVerify(address cToken, address minter, uint mintAmount, uint mintTokens) external;

    function redeemAllowed(address cToken, address redeemer, uint redeemTokens) external returns (uint);
    function redeemVerify(address cToken, address redeemer, uint redeemAmount, uint redeemTokens) external;

    function borrowAllowed(address cToken, address borrower, uint borrowAmount) external returns (uint);
    function borrowVerify(address cToken, address borrower, uint borrowAmount) external;

    function repayBorrowAllowed(address cToken, address payer, address borrower, uint repayAmount) external returns (uint);
    function repayBorrowVerify(address cToken,address payer,address borrower,uint repayAmount,uint borrowerIndex) external;
}



/// @notice SCREAM_Strategy takes vaults funds and deposits them into Scream as collateral,
///         borrows against the collateral and deposits them again, earning farm token
///         which is sold for more USDC and deposited back into SCREAM_Strategy
/// @dev SCREAM_Strategy interacts with: 1) Scream USDC token, 2) Antei Vault, 3) Comptroller
/// @dev Bot must be able to harvest and call strategies functions
contract SCREAM_Strategy {
    address public owner;
    address public anteiVault;
    address public usdc; 
    address public screamContract;
    address public comptroller;

    constructor(address _anteiVault, address _usdc, address _screamContract, address _comptroller) {
        owner = msg.sender;
        anteiVault = _anteiVault;
        usdc = _usdc;
        screamContract = _screamContract;
        comptroller = _comptroller;
    }


    function deposit(uint256 _amount) external { 
        IERC20(usdc).transferFrom(msg.sender, address(this), _amount);

        // scream must be able to spend our usdc
        IERC20(usdc).approve(screamContract, _amount);

        // call mint function, receives scUSDC
        IScream(screamContract).mint(_amount);
        
        // when strategy receives token, borrow against it
        borrow();
    }


    /// @dev need to enter markets to deposit collateral. Interact with COMPTROLLER
    /// @dev need to calculate how much is it possible to borrow by calling getAccountSnapshot on the screamContract
    function borrow() internal {
        IComptroller comp =  IComptroller(comptroller);
        IScream cToken = IScream(screamContract);
        address[] memory scUSDC = new address[](1);
        scUSDC[0] =  screamContract; 
        uint256[] memory errors = comp.enterMarkets(scUSDC);
        if(errors[0] != 0){
            revert("Comptroller enterMarkets failed");
        }
        // get account liquidity, returns (error, token balance, borrow balance, exchange rate mantissa)
        (uint error2, uint tokenBalance, uint borrowBalance, uint exchangeRate) = cToken.getAccountSnapshot(address(this));
        if(error2 != 0){
            revert("account snapshot error");
        }
        require(borrowBalance == 0, "account underwater");
        require(tokenBalance > 0, "account has excess collateral");

        // BEWARE NOT SUFFICIENT SHORTFALL, AM I BORROWING TOO MUCH? 10000000000 -> caused ERR 3 not sufficient shortfall
        uint amount = 1000000; 
        uint failure = cToken.borrow(amount);
        if(failure != 0) {
            revert('failure borrowing');
        }

        uint borrows = cToken.borrowBalanceCurrent(address(this));
    }


    /// @dev only bot should be able to call harvest
    function harvest() external  {

    }


    /// Redeem based on cTOKEN amount
    /// @param _type true = redeem(), false = redeemUnderlying()
    function withdraw(uint256 _amount, bool _type) external {
        if(_type == true){
            /// redeem based on amount of cTOKEN
            IScream(screamContract).redeem(_amount);
        } else {
            // redeem based on the amount of asset
            IScream(screamContract).redeemUnderlying(_amount);
        }
    }

}