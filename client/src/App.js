import React, { Component } from "react";
import Sikka from "./contracts/Sikka.json";
import SikkaTokenSale from "./contracts/SikkaTokenSale.json";
import KycContract from "./contracts/KycContract.json";

import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {

  state = { 
    loading : false, 
    kycAddress: "0x00000", 
    tokenSaleAddress: null,
    totalSupply: 0,
    userTokens: 0,
    inputAmount: 1,
    isOwner : false
  };

  componentDidMount = async () => {
    try {
      
      this.web3 = await getWeb3();

      this.accounts = await this.web3.eth.getAccounts();

      this.networkId = await this.web3.eth.net.getId();
      
      this.sikkaInstance = new this.web3.eth.Contract(
        Sikka.abi,
        Sikka.networks[this.networkId] && Sikka.networks[this.networkId].address,
      );

      this.sikkaSaleInstance = new this.web3.eth.Contract(
        SikkaTokenSale.abi,
        SikkaTokenSale.networks[this.networkId] && SikkaTokenSale.networks[this.networkId].address,
      );

      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      this.owner = await this.kycInstance.methods.owner().call();

      this.listenToTokenTransfer();
      this.setState({
        loaded:true, 
        tokenSaleAddress:SikkaTokenSale.networks[this.networkId].address,
        isOwner: this.owner === this.accounts[0]
      }, 
        this.updateFunction );


    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  updateFunction = () => {
    this.updateUserTokens();
  }

  updateUserTokens = async() => {
    let userTokens = await this.sikkaInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens:userTokens});
    this.updateTotalSupply();
  }

  updateTotalSupply = async() => {
    let totalSupply = await this.sikkaInstance.methods.totalSupply().call();
    this.setState({totalSupply:totalSupply});
  }

  listenToTokenTransfer = () => {
    this.sikkaInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens)
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.clicked : target.value;
    const name = target.name;
    this.setState({
      [name] : value
    });
  }

  handleKYCWhitelisting = async() => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert("KYC Verification for "+this.state.kycAddress+" is completed!");
  }

  handleBuyTokens = async() => {
    await this.sikkaSaleInstance.methods.buyTokens(this.accounts[0])
    .send({from: this.accounts[0], value : this.web3.utils.toWei(this.state.inputAmount.toString(),"wei")});
  }


  render() {
    if (this.state.loading) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Sikka Token Sale</h1>
        <p>
          Get your Sikka Token today!
        </p>
        {this.state.isOwner && 
          <div>
            <h2>Kyc Whitelisting</h2>
            <p>
              Address to allow : <input type = "text" name = "kycAddress" value = {this.state.kycAddress} onChange = {this.handleInputChange}/> 
              <button type = "button" onClick = {this.handleKYCWhitelisting}> Add to Whitelist </button> 
            </p>

          </div>  
        }

        <h2>Total SIKKA supply  : {this.state.totalSupply}</h2>
        <p>
          If you want to buy tokens, send Wei to this address : {this.state.tokenSaleAddress} 
        </p>
        <br/>
        <h3> <p>You currently have {this.state.userTokens} SIKKA </p> </h3>
        <p>I want <input type = "text" name = "inputAmount" value = {this.state.inputAmount} onChange={this.handleInputChange} /> WEI worth of SIK.</p>
        <p><button type = "button" onClick = {this.handleBuyTokens}> BUY </button></p>
      </div>
    );
  }
}

export default App;
