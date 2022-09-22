const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

if (developmentChains.includes(network.name)) {
  describe("FundMe", async () => {
    let fundMe, Deployer, MockV3Aggregator
    const $1ETH = ethers.utils.parseEther("1")
    beforeEach(async () => {
      // deploy all contracts that we have
      const { deployer } = await getNamedAccounts()
      Deployer = deployer
      await deployments.fixture(["all"])
      fundMe = await ethers.getContract("FundMe", deployer)
      MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    describe("constructor", async () => {
      it("set the aggregator addresses correctly", async () => {
        const response = await fundMe.getPriceFeed()
        assert.equal(response, MockV3Aggregator.address)
      })
    })

    describe("fund", async () => {
      it("fails if you don't send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith(
          "You need to spend more ETH!"
        )
      })
      it("Update the amount of funded data structure", async () => {
        await fundMe.fund({ value: $1ETH })
        const response = await fundMe.getAddressToAmount(Deployer)
        assert.equal($1ETH, response.toString())
      })

      it("Adds a funder to the array of getFunders", async () => {
        await fundMe.fund({ value: $1ETH })
        const funder = await fundMe.getFunders(0)
        assert.equal(funder, Deployer)
      })
    })

    describe("withdraw", async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: $1ETH })
      })
      it("withdraw ETH from a single funder", async () => {
        //Arrange
        const startingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        const startingDeployerBalance = await fundMe.provider.getBalance(
          Deployer
        )
        //Act
        const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait(1)
        const { gasUsed, effectiveGasPrise } = transactionReceipt
        const gasCost = gasUsed * effectiveGasPrise
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        const endingDeployerBalance = await fundMe.provider.getBalance(Deployer)
        //Assert
        assert.equal(endingFundMeBalance, 0)
        // assert.equal(
        // 	(startingFundMeBalance + startingDeployerBalance),
        // 	(endingDeployerBalance + gasCost)
        // )
      })
    })
  })
}
