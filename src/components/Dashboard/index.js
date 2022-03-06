import React, { useEffect,useState } from "react";
import { ethers, utils } from 'ethers'
import { Eve, Logo } from "resources/index";
import { formatEther } from "@ethersproject/units";
import {whitePaper} from '../../whitelist/whitelist';
import {addrList} from './addrList';
import { Contract } from "@ethersproject/contracts";
import { ToastContainer, toast } from 'react-toastify';
import{preSaleContractAddr} from '../../contract_ABI/contractData';
import {usdtContractAddr,tokenAddr} from '../../contract_ABI/contractData';
import { useEthers, useEtherBalance, useContractFunction } from "@usedapp/core";
import { usePreSaleContractMethod, useGetTotalSupply, useTotalSold, useTokenContractMethod,usePreSaleStatus, useGetPrice} from 'Util/connectContract';
import 'react-toastify/dist/ReactToastify.css';
import "./style.scss"
const { toChecksumAddress } = require('ethereum-checksum-address');

const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');

const Dashboard = () => {
  const { deactivate, account, chainId, activateBrowserWallet } = useEthers();
  const approveAbi = ["function approve(address spender, uint256 amount) external"];
  const etherBalance = useEtherBalance(account);

  const [rootValue, setRootVal] = useState('');
  const [proof, setproof] = useState([]);
  const[totalSupplyState, setTotalSupplyState] = useState(0);
  const [soldTokenAcount, setSoldTokenAcount] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [whiteListPrice, setWhiteListPrice] = useState(0);
  const [inputPrice, setInputPrice] = useState('');

  const [walletClick, setWalletClick] = useState(false);
  const [walletConnectState, setWalletConnectState] = useState(false);
  const [enableState, setEnableState] = useState(true);
  const [btnAvailable, setBtnAvailable] = useState(false);
  const [timeEnd, setTimeEnd] = useState(false);

  const getPreSaleStatus = usePreSaleStatus();

  useEffect(()=>{
    connectWallet();
    setEnableState(true);
    setBtnAvailable(false);
  },[])

  useEffect(()=>{
    let addr; 
    if(account) {
      addr = account; 
      setWalletClick(true);
    }
    // root value calculate   
    const leaves = addrList.map((v) => keccak256(v));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = keccak256(addr);
    const _proof = tree.getHexProof(leaf);
    const verified = tree.verify(proof, leaf, root);
    
    // console.log('root: ', root,"toChecksumAddress");
    setproof(_proof);
    setRootVal(root);
    // console.log("addr!!!!",toChecksumAddress(addr));
    // get the value of the whitelist===> price

    console.log("getPreSaleStatus",getPreSaleStatus);
    if(getPreSaleStatus != "active"){
      setWhiteListPrice('You can buy as much as you like in');
      setTimeEnd(true);
    }else{
      const buyerPrice = whitePaper[toChecksumAddress(addr)];
      if(buyerPrice){
        setWhiteListPrice(buyerPrice * 4);
      }else {
        setWhiteListPrice(0);
      }
    }

    setEnableState(true);
    setInputPrice('')
  },[account, getPreSaleStatus]);

  // connect the wallet
  useEffect(()=>{
    if (account) {
      setWalletClick(true);
      checkBNB()
    }
  },[chainId,account])
    
// --approve function
  const approveContract = new Contract(usdtContractAddr, approveAbi);
  const { state: approveState, send: approveFunction, events: getApprove } = useContractFunction(approveContract, "approve", {});
  // const { state: approveState, send: approveFunction, events: getApprove } = useTokenContractMethod( "approve");
  useEffect(()=>{
    if(approveState.status == "Success"){
      setBtnAvailable(false);
      setEnableState(false);
      toast("Approved Successfully!", {
        position: "top-right",
        // autoClose: 3000,
        // hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        type: 'success'
      })
    }
  },[approveState])


// --Buy smart contract
    const { state: statewhitelistMint, send: whitelistMint, events: getEventwhitelistMint } = usePreSaleContractMethod("whitelistMint");
    useEffect(() => {
      if (statewhitelistMint.status == "Success") {
        setBtnAvailable(false);
        setEnableState(true);
        toast("EVE Token Successfully Purchased!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          type: 'success'
        })
      } else if (statewhitelistMint.status == "Exception") {
        setBtnAvailable(false);
        // console.log("statewhitelistMint.errorMessage",statewhitelistMint.errorMessage)
        if(statewhitelistMint.errorMessage) {
          toast(statewhitelistMint.errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            type: 'error'
          })
        }else{
          toast("EVE Token purchase failure", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            type: 'error'
          })
        }
      }
  }, [statewhitelistMint])

//#get# --totalSold from contract #get#
    const totalSoldFromContract  = useTotalSold();
    useEffect(()=>{
      let temp = Number(totalSoldFromContract).toString();
      if(totalSoldFromContract){
        let soldcount = Number(temp / (10**18)).toFixed(2);
        setSoldTokenAcount(soldcount);
        
      }
    },[totalSoldFromContract]);
//#getTokenPrice -- get current price
    const currentTokenPrice = useGetPrice();
    useEffect(()=>{
      if(currentTokenPrice){
        let temp = Number(currentTokenPrice / 10000).toString();
        console.log("#################", temp)
        setTokenPrice(temp);
        
      }
    },[currentTokenPrice]);
//#get# --totalSupply from contract 
    const totalSupplyFormContract = useGetTotalSupply();
    useEffect(()=>{
      let temp = Number(totalSupplyFormContract).toString();
      if(totalSupplyFormContract){
        let totalToken = Number(temp / (10**18)).toFixed(2);
        setTotalSupplyState(totalToken); 
      }
    },[totalSupplyFormContract]);

//#click# --enable function
  function handleEnable(){
    // check the wallet connection!
    if(!walletConnectState) {
      toast('Please connect Wallet', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        type: 'error'
      })
      return;
    }
    // console.log("buy",proof);

    // check the inputprice 
    // console.log("setiput",inputPrice,"????",whiteListPrice)
    if (timeEnd){
      if (inputPrice == '') {
        toast("Please input the USDT value", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          type: 'error'
        })
        return;
      }
    } else {
      if (inputPrice == '') {
        toast("Please input the USDT value", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          type: 'error'
        })
        return;
      }else if(inputPrice > whiteListPrice) {
        let toastStr = 'Value is over. Your Max allocation : ' + whiteListPrice +" USDT. "+ " Please input USDT value again";
        toast(toastStr, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          type: 'error'
        })
        return;
      }
    }

    // call contract
    let _price = Number(inputPrice).toString() +  '000000000000000000';
    setBtnAvailable(true);
    approveFunction(preSaleContractAddr.toString(), _price);
  }

  // --buy : Button Enable 
  function handleBuy() {
    let _price = Number(inputPrice).toString() +  '000000000000000000';
    setBtnAvailable(true);
    whitelistMint(proof,  _price.toString());
  }

  function checkBNB(){
    if(!walletClick) {
      return;
    }
    if( account!= undefined && !(chainId == 97 || chainId == 56)){
      toast("Please Connect the BSC Chain", {
        position: "top-right",
        autoClose: 5000000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        type: 'error'
    })
      deactivate();
      setWalletClick(false);
      setWalletConnectState(false);
    }
    setWalletConnectState(true);
  }

   function connectWallet() { 
    setWalletClick(true);
     activateBrowserWallet();
    checkBNB();
  }

  function disConnectWallet() { 
    deactivate();
    setWalletConnectState(false);
  }


  return (
    
    <div className="dashboard flex flex-column">
      <div className="dashboard-navbar flex">
        <div className="dashboard-navbar-logo flex">
          <Logo /> <span>EverVault</span>
        </div>
        {
          account
          ? <div id="walletConnected"
            onClick={disConnectWallet}
          >
               {account.slice(0, 5)}...{account.slice(
                  account.length - 4,
                  account.length
                ) + ""} 
                {etherBalance &&" : "+ parseFloat(formatEther(etherBalance)).toFixed(3) + "BNB"} 
            </div>
          :
            <button 
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
        }
      </div>

      <div className="dashboard-main flex flex-column">
        <Logo />
        <h1>$Eve {timeEnd?'Public' : 'WhiteList'} Sale</h1>
        <p className="flex">
          <Eve /> {totalSupplyState} $Eve tokens for sale
        </p>
        <div className="dashboard-main-info grid">
          <div className="flex flex-column">
            <span>Eve Price</span>
            <p>{tokenPrice} USDT</p>
          </div>
          <div className="flex flex-column">
            <span>Total Eve</span>
            <p>{totalSupplyState}</p>
          </div>
          <div className="flex flex-column">
            <span>Eve Sold</span>
            <p>{soldTokenAcount}</p>
          </div>
        </div>
        <div className="dashboard-main-sale flex flex-column">
          <h5>Your Contribution</h5>
          <Eve />
          <label htmlFor="attribution">
            Max Allocation <span>{whiteListPrice} USDT</span>
          </label>
          <div className="flex">
            <input id="attribution" type="text"
            disabled={enableState? false : true}
            placeholder='0'
            value={inputPrice }
              onChange={e=>{
                setInputPrice(e.target.value);
              }}
            />
          </div>
          <div id="btn-div">
            {
              enableState
              ?<>
               <button id="buybtnUnEnable"  onClick={handleEnable} disabled={btnAvailable ? true :false} >Enable USDT</button>
               <button id="buybtnEnable">Buy</button>
              </>
              :<>
                <button id="buybtnEnable" >Enable USDT</button>
                <button id="buybtnUnEnable" onClick={handleBuy} disabled={btnAvailable ? true : false}>Buy</button>
              </>
            }
          </div>
          <p>$EVE Contract Address</p>
          <a
            href="https://bscscan.com/address/0x02Fe5De7a9Cc7c7111BD71eF40A299bEDc86a5a3"
            target="_blank"
            rel="noreferrer"
          >
          {tokenAddr}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
