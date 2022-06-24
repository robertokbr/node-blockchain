const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');
const BlockClass = require('./block.js');

class Blockchain {
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  async initializeChain() {
    if (this.height === -1) {
      const block = new BlockClass.Block({ data: 'Genesis Block' });
      await this._addBlock(block);
    }
  }

  getChainHeight() {
    return new Promise((resolve, _) => {
      resolve(this.height);
    });
  }

  //
  _addBlock(block) {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        ++self.height;
        block.height = self.height;
        block.time = new Date().getTime();
        block.previousBlockHash = self.chain[self.height - 1]?.hash;
        const { hash: _, ...data } = block;
				block.hash = SHA256(JSON.stringify(data)).toString();
        self.chain.push(block);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  requestMessageOwnershipVerification(address) {
    return new Promise((resolve) => {
      resolve(
        `${address}:${new Date(Date.now()).getTime().toString().slice(0, -3)}:starRegistry`,
      );
    });
  }

  submitStar(address, message, signature, star) {
    const self = this;
    return new Promise((resolve, reject) => {
      const time = parseInt(message.split(':')[1], 10);
      const currentTime = parseInt(new Date(Date.now()).getTime().toString().slice(0, -3), 10);
      const timeElapsed = currentTime - time;
      if (timeElapsed < (5 * 60)) {
        if (bitcoinMessage.verify(message, address, signature)) {
          star.owner = address;
          const block = new BlockClass.Block(star);
          return self._addBlock(block).then(() => resolve(block));
        } else {
          reject(new Error('Invalid signature'));
        }
      }

      reject(new Error('Invalid time'));
    });
  }

  getBlockByHash(hash) {
    const self = this;
    return new Promise((resolve, reject) => {
      const block = self.chain.find((p) => p.hash === hash);

      return block ? resolve(block) : reject(Error('Block not found'));
    });
  }

  getBlockByHeight(height) {
    const self = this;
    return new Promise((resolve, reject) => {
      const block = self.chain.filter((p) => p.height === height)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  getStarsByWalletAddress(address) {
    const self = this;
    return new Promise((resolve) => {
      const stars = [];

      const promises = self.chain.map(async (block) => {
        const data = await block.getBData();
        if (data?.owner === address) stars.push(data);
      });

      Promise.all(promises).then(() => resolve(stars));
    });
  }

  validateChain() {
    const self = this;
    const errorLog = [];
    return new Promise((resolve) => {
      self.chain.reduce(async (a, b, i) => {
        const isValid = await a;
        if (!isValid) errorLog.push(`Block ${self.chain[i -1].height} is invalid`);

        if (i > 0 && self.chain[i -1].hash !== b.previousBlockHash) {
          errorLog.push(
            `Block ${b.height} previousBlockHash is invalid`,
          );
        }

        return b.validate();
      }, Promise.resolve(true)).then(() => resolve(errorLog));
    });
  }
}

module.exports.Blockchain = Blockchain;
