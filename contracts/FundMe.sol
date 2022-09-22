// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe_NotOwner();

/** @title A contracut for crowd funding
 * @author Taras Kulchytskyi
 * @notice This contract is to demo a sample contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
  using PriceConverter for uint256;
  address[] private s_funders;
  AggregatorV3Interface private s_priceFeed;
  mapping(address => uint256) public s_addressToAmountFunded;
  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 50 * 10**18;

  modifier onlyOwner() {
    // require(msg.sender == owner);
    if (msg.sender != i_owner) revert FundMe_NotOwner();
    _;
  }

  /// @param priceFeedAddress chainlink price feed address
  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // Explainer from: https://solidity-by-example.org/fallback/
  // Ether is sent to contract
  //      is msg.data empty?
  //          /   \
  //         yes  no
  //         /     \
  //    receive()?  fallback()
  //     /   \
  //   yes   no
  //  /        \
  //receive()  fallback()

  fallback() external payable {
    fund();
  }

  receive() external payable {
    fund();
  }

  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "You need to spend more ETH!"
    );

    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public onlyOwner {
    address[] memory m_funders = s_funders;
    for (
      uint256 funderIndex = 0;
      funderIndex < m_funders.length;
      funderIndex++
    ) {
      address funder = m_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);

    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function getOwnder() public view returns (address) {
    return i_owner;
  }

  function getFunders(uint256 _index) public view returns (address) {
    return s_funders[_index];
  }

  function getAddressToAmount(address _address) public view returns (uint256) {
    return s_addressToAmountFunded[_address];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
