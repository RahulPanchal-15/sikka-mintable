var Sikka = artifacts.require("Sikka");
var RoleLibrary = artifacts.require("Roles");
var SikkaTokenSale = artifacts.require("SikkaTokenSale");
var KycContract = artifacts.require("KycContract");
require("dotenv").config({path: "../.env"});


module.exports = async(deployer) => {
  const accounts = await web3.eth.getAccounts();
  await deployer.deploy(RoleLibrary);
  await deployer.link(RoleLibrary,Sikka);
  await deployer.deploy(Sikka);
  await deployer.deploy(KycContract);
  await deployer.deploy(SikkaTokenSale,1,accounts[0],Sikka.address,KycContract.address);
  console.log("Adding TokenSaleContract as Minter")
  let TokenInstance = await Sikka.deployed();
  await TokenInstance.addMinter(SikkaTokenSale.address);
  // console.log("Minting 1000000 SIKKA to Crowdsale!");
  // await TokenInstance.mint(SikkaTokenSale.address,process.env.INITIAL_MINT);
};
