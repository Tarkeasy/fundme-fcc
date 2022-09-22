const { run } = require("hardhat")

module.exports.verify = async (contractAddress, args) => {
  console.log("ARG!!!", args)
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    console.log("Error verify:", error.message)
  }
}
