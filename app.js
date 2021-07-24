require('dotenv').config();

const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios');

// blockchain gateway
const infuraKey = process.env.INFURA_KEY;
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraKey}`));

// contract we are interested of
const contractAddress = '0x11739d7bd793543a6e83bd7d8601fcbcde04e798'; 
const abi = fs.readFileSync(`${__dirname}/abi.json`, 'utf8');
const contract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

const marketplaceWalletAddress = '0xefaa0f8e57f6280d46072b97473ac3f04b083f9d'; // uber wallet
const callerAddress = '0x8863ae48646c493efF8cd54f9Ffb8Be89669E62A'; // less important information here

getTokensIds()
    .then((tokensIds) => {
        return Promise.all(tokensIds.map(tokenId => getTokenMetadata(tokenId)));
    })
    .then((tokensMetadataUrls) => {
        return Promise.all(tokensMetadataUrls.map(url => axios(url)));
    })
    .then((tokens) => {
        tokens.forEach(token => {
            console.log(token.data);
        });
    })
    .catch(err => console.log(err));

function getTokensIds() {
    return new Promise((resolve, reject) => {
        contract.methods.tokenIdsForOwner(marketplaceWalletAddress)
            .call({ from: callerAddress }, (error, result) => {
                if (result) {     
                    return resolve(result);
                }
                reject(error);
            });
        });
}

function getTokenMetadata(tokenId) {
    return new Promise((resolve, reject) => {
        contract.methods.tokenURI(tokenId)
            .call({ from: callerAddress }, (error, result) => {
                if (result) {
                    return resolve(result);            
                }
                reject(error);
            });
        });
}