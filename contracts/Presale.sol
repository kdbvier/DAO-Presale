// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBEP20 {
  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the token decimals.
   */
  function decimals() external view returns (uint8);

  /**
   * @dev Returns the token symbol.
   */
  function symbol() external view returns (string memory);

  /**
  * @dev Returns the token name.
  */
  function name() external view returns (string memory);

  /**
   * @dev Returns the bep token owner.
   */
  function getOwner() external view returns (address);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external returns (bool);

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address _owner, address spender) external view returns (uint256);

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external returns (bool);

  /**
   * @dev Moves `amount` tokens from `sender` to `recipient` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

  /**
   * @dev Emitted when `value` tokens are moved from one account (`from`) to
   * another (`to`).
   *
   * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
   * @dev Emitted when the allowance of a `spender` for an `owner` is set by
   * a call to {approve}. `value` is the new allowance.
   */
  event Approval(address indexed owner, address indexed spender, uint256 value);
}


 contract Presale {

  bytes32 private merkleRoot;
  address private treasuryWallet; // admin wallet address(receive money)
  address private token;
  address public payCurrency; // USDT
  address private ownerAddr;
  uint public endTime;
  uint256 public totalSold;
  uint256 public tokenPrice;
  mapping(address=>bool) public active;

  event varifyState(bool varify);
  event UpdateTreasuryWallet(address treasuryWallet);
  event UpdatePayCurrency(address paycurrency);

  constructor(){
    ownerAddr = msg.sender;
    treasuryWallet = address(0x6B6Cd9B3D7399dd2978C8eeA35aB25d99e79BE6a); //treasury wallet address
    token = address(0x02Fe5De7a9Cc7c7111BD71eF40A299bEDc86a5a3);
    payCurrency = address(0x55d398326f99059fF775485246999027B3197955);
    tokenPrice = 40000 ;
  }

  // withdraw
  function withDraw(uint256 _tokenAmount) external onlyOwner returns(uint256) {
    require(_tokenAmount > 0, "Token amount is invalid");
    require(IBEP20(token).balanceOf(address(this)) >= _tokenAmount, "Not enought token amount");
    require(IBEP20(token).transfer(msg.sender, _tokenAmount), "Deposit: transfer failed");
    return _tokenAmount;
  }
  function getTokenAmount() external view returns(uint256) {
    return IBEP20(token).balanceOf(address(this));
  }
  // presale function
  function whitelistMint(
    bytes32[] memory _proof,
    uint256 _price
  ) external payable returns(bool) {
    require(endTime != 0,"Please wait for start presale");
    if (block.timestamp <= endTime){
    require(!active[msg.sender],"You have already bought EVE token");
      require(verifyWhitelist(_leaf(msg.sender), _proof) == true,"You are not member of the whitelist");
    }
    uint256 _amount = (_price * 10000) / tokenPrice;
    require(_amount > 0, "EVE token amount parameter is invalid");
     require(_price > 0, "EVE token balance is invalid");
    require(IBEP20(payCurrency).balanceOf(msg.sender) >= _price, "Your balance not enough");
    require(IBEP20(token).balanceOf(address(this)) >= _amount,"Not enough EVE token in the contract");
    IBEP20(payCurrency).transferFrom(payable(msg.sender), payable(treasuryWallet), _price);
    IBEP20(token).transfer(msg.sender, _amount);
    active[msg.sender] = true;
    totalSold = totalSold + _amount;
    emit varifyState(true);
    return true;
  }

  // get function
  function getPresaleStatus() external view returns(string memory){
    require(endTime > 0,"Not start");
    if (block.timestamp <= endTime){
      return "active";
    }else{
      return "end";
    }
  }
  function getActive(address _sender) external view returns(bool){
      return active[_sender];
  }
  function getTotalSold() external view returns(uint256) {
    return totalSold;
  }
  function getContractBalance() public view returns(uint256) {
      return IBEP20(payCurrency).balanceOf(address(this));
  }

  // set time
  function getBlockTime() external view returns(uint){
    return block.timestamp;
  }
  function getendTime() external view returns(uint){
    return endTime;
  }
  function setPresaleTime(uint _startTime, uint daysAfter) external onlyOwner returns(uint) {
    endTime = _startTime + daysAfter * 1 days;
    return endTime;
  }
  //set setting

  function getTokenPrice() external view onlyOwner returns(uint256) {
    return tokenPrice;
  }
   function setTokenPrice(uint256 _tokenPrice) external onlyOwner returns(uint256) {
    tokenPrice = _tokenPrice;
    return tokenPrice;
  }
  function setToken(address _tokenAddr) external onlyOwner returns(address) {
    token =_tokenAddr;
    return token;
  }

  function setTreasuryWallet(address _treasuryWallet) external onlyOwner {// treasury wallet update
    treasuryWallet = _treasuryWallet;
    emit UpdateTreasuryWallet(_treasuryWallet);
  }

  function setPayCurrency(address _paycurrency) external onlyOwner {// paycurrency address update
    payCurrency = _paycurrency;
    emit UpdatePayCurrency(_paycurrency);
  }
  // get value
  function getPayCurrency() external view onlyOwner returns(address){// paycurrency address update
    return payCurrency;
  }

  function getTreasuryWallet() external onlyOwner view returns(address) {// get treasury wallet address
    return treasuryWallet;
  }



  // varify wallet address
  function _leaf(address account) private pure returns (bytes32) {
      return keccak256(abi.encodePacked(account));
  }
  function verifyWhitelist(bytes32 leaf, bytes32[] memory proof) private view returns (bool) {
      bytes32 computedHash = leaf;

      for (uint256 i = 0; i < proof.length; i++) {
          bytes32 proofElement = proof[i];

          if (computedHash < proofElement) {
              // Hash(current computed hash + current element of the proof)
              computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
          } else {
              // Hash(current element of the proof + current computed hash)
              computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
          }
      }

      // Check if the computed hash (root) is equal to the provided root
      return computedHash == merkleRoot;
  }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner returns (bytes32) {
        merkleRoot = _merkleRoot;
        return merkleRoot;
    }

    function getRoot() external view returns(bytes32){
        return merkleRoot;
    }

    function getOwner() external view  returns(address){
      return ownerAddr;
    }
    function setOwner(address _owner) external onlyOwner returns(address){
      ownerAddr = _owner;
      return ownerAddr;
    }

    modifier onlyOwner() {
        require(ownerAddr == msg.sender, "Ownable: caller is not the owner");
        _;
    }
  //end
}