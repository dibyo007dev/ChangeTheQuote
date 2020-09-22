import "./App.css";
import React, { Component } from "react";
import { TezosNodeWriter, TezosParameterFormat } from "conseiljs";
import { ThanosWallet } from "@thanos-wallet/dapp";

const conseiljs = require("conseiljs");

// Key manager
var key = {
  publicKey: "edpkuZHZjYFPFR713NsH41i946z8PiZ4Ho7F4KbvdMiNgKA7XHrqKL",
  privateKey:
    "edskRevMtNnc1W5jkPAKJDhC2oipaYuogxR3fZrsXhtZUsQrjibcU4WpnuS6WinNZ4WT8zNPpeSJHuUoEB83wwwuk9fkPv8z65",
  publicKeyHash: "tz1NN5QooJWkW44KFfrXqLRaxEa5Wxw3f9FF",
  seed: "",
  storeType: conseiljs.StoreType.Fundraiser,
};

var tezosNode = "https://testnet.tezster.tech",
  contractAddress = "KT1AscmngZdf2D7ETmVhbKJAJWtwWzLFyJ2G";

// App component
class App extends Component {
  constructor() {
    super();
    this.state = {
      contract: contractAddress,
      wallet: key.publicKeyHash,
      newQuote: "",
      newOwner: "",
      userSignature: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.mintToken = this.mintToken.bind(this);

    (async () => {
      try {
        const available = await ThanosWallet.isAvailable();
        if (!available) {
          throw new Error("Thanos Wallet not installed");
        }

        const wallet = new ThanosWallet("My Super DApp");
        await wallet.connect("carthagenet");
        const tezos = wallet.toTezos();

        const accountPkh = await tezos.wallet.pkh();
        const accountBalance = await tezos.tz.getBalance(accountPkh);
        console.info(`address: ${accountPkh}, balance: ${accountBalance}`);
      } catch (err) {
        console.error(err);
      }
    })();
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async mintToken() {
    console.log(this.state.newQuote, this.state.amount);

    var keystore = key,
      amount = 1,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Pair "${this.state.newOwner}" (Pair "${this.state.newQuote}" "${this.state.userSignature}"))`,
      derivation_path = "";

    // TezosNodeWriter is responsible for writing in the Tezos Blockchain and costs GAS
    const result = await TezosNodeWriter.sendContractInvocationOperation(
      tezosNode,
      keystore,
      contractAddress,
      amount,
      fee,
      derivation_path,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      TezosParameterFormat.Michelson
    );

    this.setState({ latest_Og: result.operationGroupID });
    alert(
      `Injected operation ! \n Invocation Group ID : ${result.operationGroupID}`
    );
  }

  render() {
    return (
      <div className="container">
        <h1 className="navbar navbar-expand-lg navbar-light bg-light">
          {" "}
          Quote Updater | Demo
        </h1>
        <br />
        <p>Contract Address Interacting with : {this.state.contract}</p>
        <br />
        <p>Wallet Address Detected : {this.state.wallet}</p>
        <p> Latest Operation Group ID : {this.state.latest_Og}</p>

        <h3>Update Quote</h3>
        <div className="form-row align-items-center">
          <div className="col-auto">
            <label className="sr-only" htmlFor="inlineFormInputGroup">
              NewOwner Address
            </label>
            <div className="input-group mb-2">
              <div className="input-group-prepend">
                <div className="input-group-text">Address</div>
              </div>
              <input
                type="text"
                className="form-control"
                id="newOwner"
                name="newOwner"
                placeholder="tz1.*"
                value={this.state.newOwner}
                onChange={this.handleInputChange}
              />
            </div>
          </div>
          <div className="col-auto">
            <label className="sr-only">Amount</label>
            <div className="input-group mb-2">
              <div className="input-group-prepend">
                <div className="input-group-text">Token Count</div>
              </div>
              <input
                type="text"
                className="form-control"
                id="amount"
                name="amount"
                placeholder="Number"
                value={this.state.amount}
                onChange={this.handleInputChange}
              />
            </div>
          </div>
          <div className="col-auto">
            <button
              type="submit"
              className="btn btn-primary mb-2"
              onClick={this.mintToken}
            >
              Mint
            </button>
          </div>
        </div>
        <br />

        <p> Token minted for : {this.state.address}</p>
        <p> Token Count : {this.state.amount}</p>
      </div>
    );
  }
}

export default App;
