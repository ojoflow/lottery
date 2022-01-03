const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); //capital W because we're invoking the constructor
const web3 = new Web3(ganache.provider());

const {abi, evm } = request('../compile');

let lottery;
let accounts;

beforeEach(
    async () => {
        accounts = await web3.eth.getAccounts();

        lottery = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode})
        .send({from: accounts[0], gas: '1000000'});
    });

describe('Lottery Contract', () => {
    
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
});