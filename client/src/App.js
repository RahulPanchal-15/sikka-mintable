import React, { Component } from "react";
import Sikka from "./contracts/Sikka.json";
import SikkaTokenSale from "./contracts/SikkaTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import coingif from "./coin-mario.gif";

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
    isOwner : false,
    isVerified : false
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

      const verified = await this.kycInstance.methods.kycCompleted(this.accounts[0]).call();
      
      this.listenToTokenTransfer();
      this.setState({
        tokenSaleAddress:SikkaTokenSale.networks[this.networkId].address,
        isVerified: verified,
        isOwner: this.owner === this.accounts[0],
        loaded:true, 
      }, 
        this.updateFunction );


    } catch (error) {
      alert(
        `Install Metamask extension and choose the Ropsten TestNet.`,
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
  };


  render() {
    if (this.state.loading) {
      return <div>Loading Metamask, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <br/>
        <br/>
        <div className = "container-fluid">
        <div className = "aligned">
        <img src = {coingif} alt = "Coin" style={{width: 60}}/><span><h1>Sikka Token Sale</h1></span><img src = {coingif} alt = "Coin" style={{width: 60}}/>
        </div>
        <p>
          <font size="12px"><i>Get your Sikka Token today, Invest in the future!</i></font>
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
        <font size="6"><i>Total SIKKA supply  : {this.state.totalSupply}</i></font>
        <br/>
        <div className="alert alert-warning" role="alert" style={{width: "500px", display: "inline-block"}}>
          Sikka Token ICO has been deployed on the Ropsten TestNet.<br/>
          <a href="https://faucet.ropsten.be/" target="_">Use Ropsten Test Ether to buy Sikka!</a> 
        </div>

        <hr/>
        {this.state.isVerified && 

          <div>  
            <p>
              If you want to buy SIKKA tokens, send Wei to this address :  
            </p>
            <div className="alert alert-info" role="alert" style={{width: "500px", display: "inline-block"}}>
              {this.state.tokenSaleAddress}
            </div>
            <br/>

            <font size="5"><p>You currently have {this.state.userTokens} SIKKA </p></font>
            <div className="alert alert-dark" role="alert" style={{width: "500px", height: "100px", display: "inline-block"}}>
              <p>I want <input type = "text" name = "inputAmount" value = {this.state.inputAmount} min= "1" onChange={this.handleInputChange} /> SIKKA.</p>
              <p><button type = "button" className="btn btn-primary" onClick = {this.handleBuyTokens}> BUY </button></p>
            </div>
          </div>
        }
        {!this.state.isVerified && 
          <div className="alert alert-danger" role="alert" style={{width: "500px", display:"inline-block"}}>
            This Address has not yet been verified.<br/>
            Send us your name and account address on Telegram!<br/>
            <a href="http://t.me/sikkaToken" target="_">SikkaTokenSale Channel</a>
          </div>
        }
        
      
      </div>
      </div>

    );
  }
}

export default App;
