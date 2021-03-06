// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public players;    

        constructor() {
                manager = msg.sender;

        
        }

        function enter() public payable {
                require(msg.value > .01 ether, "not enough ether to participate");
                players.push(msg.sender);
        } 
        
        function random() private view returns (uint) {
                return uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp,players)));
        }

        function pickWinner() public restricted{
                
                uint index = random() % players.length;
                payable(players[index]).transfer(address(this).balance);
                //lastWinner = players[index];
                players = new address[](0); //initialize dynamic array with length zero
        }

        modifier restricted() {
                require(msg.sender == manager);
                _;
        }

        function getPlayers() public view returns (address[] memory) {
                return players;
        }
}