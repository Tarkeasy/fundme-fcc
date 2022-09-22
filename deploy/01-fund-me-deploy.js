const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    // Goerli Testnet ETH/USD 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUSDPriceAddress"]
  }
  const args = [ethUsdPriceFeedAddress]
  const contract = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  // Not verify on local network
  if (!developmentChains.includes(network.name)) {
    await verify(contract.address, args)
  }
}
module.exports.tags = ["all", "FundMe"]
