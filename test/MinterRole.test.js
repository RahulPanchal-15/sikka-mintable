const Sikka = artifacts.require('Sikka');
const SikkaTokenSale = artifacts.require("SikkaTokenSale");
const KycContract = artifacts.require("KycContract");
const truffleAssert = require('truffle-assertions');

contract('Sikka: Test Mint', (accounts) => {
  
    const [deployerAddress, nonMinterAddress, verifyThisAddress, nonVerifiedAddress] = accounts;
    
    it(" crowdsale initially has 1000000 minted tokens", async () => {
        let token = await Sikka.deployed();
        let crowdsaleAddress = await SikkaTokenSale.address;
        let initalSupply = await token.balanceOf(crowdsaleAddress);
        assert.equal(initalSupply,1000000);
        
    });

    
    it(" account other than crowdsale cannot mint tokens", async () => {
        let token = await Sikka.deployed();
        await truffleAssert.fails(
            token.mint(nonMinterAddress,100000 , {from: nonMinterAddress}),
            truffleAssert.ErrorType.REVERT
        );
    });
        
    it(" deployer can mint tokens to crowdsale ", async () => {
        const crowdsaleAddress = SikkaTokenSale.address;
        let token = await Sikka.deployed();
        let oldBalance = await token.balanceOf(crowdsaleAddress);
        let isMinter = await token.isMinter(crowdsaleAddress);
        assert.equal(isMinter,true,"Crowdsale is not minter!");
        await truffleAssert.passes(
            token.mint(crowdsaleAddress,10, {from : deployerAddress}),
            "Could not send transaction!"   
        );
        let newBalance = await token.balanceOf(crowdsaleAddress);
        assert.equal(parseInt(oldBalance)+10,parseInt(newBalance));
    });

    it(" is possible to whitelist an address ", async () => {
        let kyc = await KycContract.deployed();
        let initialVerificationStatus = await kyc.kycCompleted(verifyThisAddress,{from: deployerAddress});
        assert.equal(initialVerificationStatus,false,"Address is initially Verified!");
        await truffleAssert.passes(
            kyc.setKycCompleted(verifyThisAddress,{from: deployerAddress}),
            "Transaction Error for setKycCompleted method"
        );
        let finalVerificationStatus = await kyc.kycCompleted(verifyThisAddress,{from: deployerAddress});
        assert.equal(finalVerificationStatus,true,"Address was not verified");
    });

    it(" only whitelisted address can buy from crowdsale ", async () => {
        let sikka = await Sikka.deployed();
        let kyc = await KycContract.deployed();
        let crowdsale = await SikkaTokenSale.deployed();
        let crowdsaleBalance = await sikka.balanceOf(crowdsale.address);
        console.log(crowdsaleBalance.toString());
        
        
        
        let initialVerificationStatus = await kyc.kycCompleted(nonVerifiedAddress,{from: deployerAddress});
        assert.equal(initialVerificationStatus,false,"Verfied Address");
        await truffleAssert.reverts(crowdsale.buyTokens(verifyThisAddress,{from: nonVerifiedAddress, value : 100}), "KYC not completed.");
        
        let oldBalance = await sikka.balanceOf(verifyThisAddress);
        let verifcationStatus = await kyc.kycCompleted(verifyThisAddress,{from: deployerAddress});
        assert.equal(verifcationStatus,true,"Unverified Address");
        await truffleAssert.passes(
            crowdsale.buyTokens(verifyThisAddress,{from: verifyThisAddress, value : 100000}),
            "Could not purchase from verified address"
        );
        let newcrowdsaleBalance = await sikka.balanceOf(crowdsale.address);
        console.log(newcrowdsaleBalance.toString());

        let newbalance = await sikka.balanceOf(verifyThisAddress);
        assert.equal(parseInt(newbalance),parseInt(oldBalance)+100000,"Tokens not recieved");
    }
    )
         
});