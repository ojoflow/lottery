const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //capital W because we're invoking the constructor
const web3 = new Web3(ganache.provider());

const {abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(
    async () => {
        accounts = await web3.eth.getAccounts();

        lottery = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from: accounts[0], gas: '1000000'});
    });

describe('Lottery Contract', () => {
    
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });
        const players = await lottery.methods.getPlayers().call(
            {from: accounts[0]}
        );

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02','ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02','ether')
        });
        const players = await lottery.methods.getPlayers().call(
            {from: accounts[0]}
        );

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum of ether to enter', async () => {
       try { //if executed without error, program proceeds
            await lottery.methods.enter().send({
            from: accounts[0],
            value:200
        });
          assert(false); //forces a fail state for the purpose of testing
        } catch (err) {
            assert(err);
        }
    });

    it('needs to be the manager who picks winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array',
        async () => {
              await lottery.methods.enter().send({
                  from: accounts[0],
                  value: web3.utils.toWei('2','ether')
              });
        const initialBalance = await web3.eth.getBalance(accounts[0]);      
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8','ether'));
        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        assert.equal(players.length, 0);
        const contractBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(contractBalance, 0);      

        });

    
});