import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import CrowdFundMulti from '../abi/MultiCrowdFund.json'

export const useWeb3Store = defineStore('web3', () => {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/')

  const accounts = ref<any[]>([])
  const selectedAccountIndex = ref<number>(0)

  let signer: ethers.Signer | null = null
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  let contract: ethers.Contract | null = null

  async function init() {
    const signers = await provider.listAccounts()
    accounts.value = await Promise.all(signers.map((signer) => signer.getAddress()))

    selectedAccountIndex.value = 0
    signer = await provider.getSigner(0)

    contract = new ethers.Contract(contractAddress, CrowdFundMulti.abi, signer)

    console.log('Web3 initialized. Active account:', accounts.value[0])
  }

  async function switchAccount(index: number) {
    if (index < 0 || index >= accounts.value.length) return

    selectedAccountIndex.value = index
    signer = await provider.getSigner(index)

    contract = new ethers.Contract(contractAddress, CrowdFundMulti.abi, signer)

    console.log('Switched to:', accounts.value[index])
  }

  const getSigner = () => signer
  const getContract = () => contract

  return {
    accounts,
    selectedAccountIndex,
    init,
    switchAccount,
    getSigner,
    getContract,
  }
})
