// SPDX-License-Identifier: MIT;
pragma solidity ^0.8.0;

import "./MintedCrowdsale.sol";
import "./KycContract.sol";

contract SikkaTokenSale is MintedCrowdsale {

    KycContract kyc;

    constructor(uint rate,address payable wallet,IERC20 token,KycContract _kyc) Crowdsale(rate,wallet,token)  {
        kyc = _kyc;
    }
    
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view override{
        super._preValidatePurchase(beneficiary,weiAmount);
        require(kyc.kycCompleted(msg.sender),"KYC not completed");
        
    }


}