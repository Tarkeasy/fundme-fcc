const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks..")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [8, 20000000000],
    })
    log("Deployed!!!")
  }
}

module.exports.tags = ["all", "mocks"]
