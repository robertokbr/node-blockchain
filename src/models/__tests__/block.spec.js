const BlockClass = require("../block");
const SHA256 = require('crypto-js/sha256');

describe("block", () => {
  let _block;

  beforeEach(async () => {
    const blockBody = { data: "fool" };
    const block = new BlockClass.Block(blockBody);
    ++block.height;
    const { hash: _, ...data } = block;
    block.hash = SHA256(JSON.stringify(data)).toString();
    _block = block;
  });

  describe("validate", () => {
    it("should be able to validate if the hash is the same as the first attributed hash", async () => {
      const isValid = await _block.validate();
      
      expect(isValid).toBe(true);
    });
  
    it("should not be able to validate if the hash is not the same as the first attributed hash", async () => {
      _block.hash = "invalid hash";	
  
      const isValid = await _block.validate();
      
      expect(isValid).toBe(false);
    });
  })

  describe("getBData", () => {
    it("should be able to return the data", async () => {
      const data = await _block.getBData();
      
      expect(data).toEqual({ data: "fool" });
    });
  });
})