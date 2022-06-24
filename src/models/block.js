const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');

class Block {
  constructor(data) {
    this.hash = null;
    this.height = 0;
    this.body = Buffer.from(JSON.stringify(data)).toString('hex');
    this.time = 0;
    this.previousBlockHash = null;
  }

  validate() {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
				const { hash: currentHash, ...data } = self;
        const hash = SHA256(JSON.stringify(data)).toString();
        return resolve(hash === currentHash);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getBData() {
    const encondedData = this.body;
    const decodedData = hex2ascii(encondedData);
    const data = JSON.parse(decodedData);
    if (this.height !== 0) {
      return Promise.resolve(data);
    }

    return Promise.resolve();
  }
}

module.exports.Block = Block;
