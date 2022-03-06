import { ethers } from 'ethers';
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction } from '@usedapp/core';

import{preSaleContractAddr } from '../contract_ABI/contractData';

const presaleContractAbi = require('../contract_ABI/presale_abi.json');
const tokenContractAbi = require('../contract_ABI/token.json');

const presaleContractInterface = new ethers.utils.Interface(presaleContractAbi);
// const tokenContractInterface = new ethers.utils.Interface(tokenContractAbi);

const presaleContract = new Contract(preSaleContractAddr, presaleContractInterface);
// const tokenContract = new Contract(tokenContractAddr, tokenContractInterface);


export function useGetOwner() {
    const [currentValue] = useContractCall({
        abi: presaleContractInterface,
        address: preSaleContractAddr,
        method: 'getOwner',
        args: []
    }) ?? [];
    return currentValue;
}

export function usePreSaleStatus() {
    const [currentValue] = useContractCall({
        abi: presaleContractInterface,
        address: preSaleContractAddr,
        method: 'getPresaleStatus',
        args: []
    }) ?? [];
    return currentValue;
}

export function useGetTotalSupply() {
    const [totalSupply] = useContractCall({
        abi: presaleContractInterface,
        address: preSaleContractAddr,
        method: 'getTokenAmount',
        args: []
    }) ?? [];
    return totalSupply;
}

export function useTotalSold() {
    const [totalSupply] = useContractCall({
        abi: presaleContractInterface,
        address: preSaleContractAddr,
        method: 'getTotalSold',
        args: []
    }) ?? [];
    return totalSupply;
}

export function useGetPrice() {
    const [currentPrice] = useContractCall({
        abi: presaleContractInterface,
        address: preSaleContractAddr,
        method: 'tokenPrice',
        args: []
    }) ?? [];
    return currentPrice;
}

// call post function(set values in smart contract... fee)
export function usePreSaleContractMethod(methodName) {
    const { state, send, events } = useContractFunction(presaleContract, methodName, {});
    return { state, send, events };
}

// export function useTokenContractMethod(methodName) {
//     console.log("ddd",methodName)
//     const { state, send, events } = useContractFunction(tokenContract, methodName, {});
//     return { state, send, events };
// }
