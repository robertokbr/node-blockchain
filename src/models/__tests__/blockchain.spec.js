const bitcoinMessage = require('bitcoinjs-message');
const BlockchainClass = require('../blockchain');

describe('blockchain', () => {
  let blockchain;

  beforeEach(async () => {
    blockchain = new BlockchainClass.Blockchain();
  });

  describe('initializeChain', () => {
    it('should be able to initialize the chain', async () => {
      await blockchain.initializeChain();
      expect(blockchain.height).toBe(0);
      expect(blockchain.chain[0].preiousBlockHash).toBeFalsy();
    });
  });

  describe('getMessageOwnershipVerification', () => {
    it('should be able to return the message to be signed', async () => {
      const date = Date.now();

      jest.spyOn(Date, 'now').mockImplementationOnce(() => date);

      const message = await blockchain.requestMessageOwnershipVerification('address');

      expect(message).toBe(
        `address:${new Date(date).getTime().toString().slice(0, -3)}:starRegistry`,
      );
    });
  });

  describe('submitStar', () => {
    it('should be able to submit a star', async () => {
      const addBlockSpy = jest.spyOn(blockchain, '_addBlock');
      const message = await blockchain.requestMessageOwnershipVerification('address');

      jest.spyOn(
        bitcoinMessage,
        'verify',
      ).mockImplementationOnce(() => true);

      const block = await blockchain.submitStar(
        'address',
        message,
        'signature',
        { star: 'fool' },
      );

      const isValid = await block.validate();

      expect(block).toBeTruthy();
      expect(addBlockSpy).toHaveBeenCalled();
      expect(isValid).toBeTruthy();
    });

    it('should not be able to submit a star if the signature is not valid', async () => {
      const message = await blockchain.requestMessageOwnershipVerification('address');

      jest.spyOn(
        bitcoinMessage,
        'verify',
      ).mockImplementationOnce(() => false);

      await expect(
        blockchain.submitStar(
          'address',
          message,
          'signature',
          { star: 'fool' },
        ),
      ).rejects.toThrow('Invalid signature');
    });

    it('should not be able to submit a star if the time is out', async () => {
      const message = await blockchain.requestMessageOwnershipVerification('address');

      jest.spyOn(
        Date,
        'now',
      ).mockImplementationOnce(() => Date.now() + 10 * 60 * 1000);

      await expect(
        blockchain.submitStar(
          'address',
          message,
          'signature',
          { star: 'fool' },
        ),
      ).rejects.toThrow('Invalid time');
    });
  });

  describe('getStarsByWalletAddress', () => {
    it('should be able to return the stars by wallet address', async () => {
      await blockchain.initializeChain();

			const message = await blockchain.requestMessageOwnershipVerification('address');

      jest.spyOn(
        bitcoinMessage,
        'verify',
      ).mockImplementationOnce(() => true);

      await blockchain.submitStar(
        'address',
        message,
        'signature',
        { star: 'fool' },
      );

      const stars = await blockchain.getStarsByWalletAddress('address');
      expect(stars).toBeTruthy();
    });
  });

	describe("validateChain", () => {
		it('should be able to validate the chain', async () => {
			const message = await blockchain.requestMessageOwnershipVerification('address');

      jest.spyOn(
        bitcoinMessage,
        'verify',
      ).mockImplementationOnce(() => true);

      await blockchain.submitStar(
        'address',
        message,
        'signature',
        { star: 'fool' },
      );

			const errorLog = await blockchain.validateChain();

			expect(errorLog.length).toBe(0);
		});
	});
});
