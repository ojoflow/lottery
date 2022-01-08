import logo from './logo.svg';
import './App.css';
import React, {Component} from 'react';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = { //sends initalized variables to the consructor 
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    //using the metamask provider will use the signed in account
    //for calls, there is no need to do from: accounts[0] syntax
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({manager, players, balance}); //manager:manager
  }

  onSubmit = async (event) => { //this syntax binds 'this' to equal our component
      event.preventDefault();

      const accounts = await web3.eth.getAccounts();

      this.setState({ message: 'Waiting on transaction sucess...'});
      await lottery.methods.enter().send(
        {from: accounts[0],
         value: web3.utils.toWei(this.state.value, 'ether')
        });
      this.setState({ message: 'You have been entered!'});  
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...'});
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked!'});
  };
  render() {
    
    //you cant use promises (i.e await syntax)
    // in the react render function so you have to use then() method
    

    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance,'ether')} ether!
        <hr/>

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value} 
              onChange={event => this.setState({ value: event.target.value})}
              />
          </div>
          <button>Enter</button>
        </form>
        <hr/>
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr/>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
