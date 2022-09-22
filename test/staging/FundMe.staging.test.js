const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) {
  describe("FundMe", async () => {
    let fundMe, deployer
    const $1ETH = ethers.utils.parseEther("1")
    beforeEach(async () => {
      // deploy all contracts that we have
      const { deployer: Deployer } = await getNamedAccounts()
      deployer = Deployer

      fundMe = await ethers.getContract("FundMe", deployer)
    })
    describe("constructor", async () => {
      it("set the aggregator addresses correctly", async () => {
        const response = await fundMe.getPriceFeed()
        assert.equal(
          response,
          networkConfig[network.config.chainId]["ethUSDPriceAddress"]
        )
      })
    })
  })
}
