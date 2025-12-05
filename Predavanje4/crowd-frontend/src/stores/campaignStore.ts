import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import { useWeb3Store } from './web3'

export const useCampaignStore = defineStore('campaigns', () => {
  const web3 = useWeb3Store()

  // LIST OF CAMPAIGNS
  const campaigns = ref<any[]>([])
  const loading = ref<boolean>(false)

  async function fetchCampaigns() {
    const contract = web3.getContract()
    if (!contract) return

    loading.value = true

    const nextId: number = Number(await contract.nextCampaignId())
    const list: any[] = []

    for (let id = 0; id < nextId; id++) {
      const c = await contract.campaigns(id)
      list.push({
        id,
        owner: c.owner,
        title: c.title,
        goal: Number(c.goal),
        deadline: Number(c.deadline),
        totalRaised: ethers.formatEther(String(c.liveBalance)),
        liveBalance: ethers.formatEther(String(c.liveBalance)),
        goalReached: c.goalReached,
        fundsWithdrawn: c.fundsWithdrawn,
      })
    }

    campaigns.value = list
    loading.value = false
  }

  // ===============================
  // Create Campaign
  // ===============================
  async function createCampaign(title: string, goalEth: string, durationMin: number) {
    const contract = web3.getContract()
    if (!contract) return

    const tx = await contract.createCampaign(title, ethers.parseEther(goalEth), durationMin)
    await tx.wait()

    await fetchCampaigns()
  }

  // ===============================
  // Donate to campaign
  // ===============================
  async function donate(id: number, amountEth: string) {
    const contract = web3.getContract()
    if (!contract) return

    const valueWei = ethers.parseEther(amountEth)

    const tx = await contract.donateTo(id, { value: valueWei })
    await tx.wait()

    await fetchCampaigns()
  }

  // ===============================
  // Withdraw (only owner)
  // ===============================
  async function withdraw(id: number) {
    const contract = web3.getContract()
    if (!contract) return

    const tx = await contract.withdrawFunds(id)
    await tx.wait()

    await fetchCampaigns()
  }

  // ===============================
  // Refund (only contributor)
  // ===============================
  async function refund(id: number) {
    const contract = web3.getContract()
    if (!contract) return

    const tx = await contract.refund(id)
    await tx.wait()

    await fetchCampaigns()
  }

  async function getContribution(id: number): Promise<number> {
    const contract = web3.getContract()

    if (!contract) return 0
    return Number(await contract.getContribution(id, activeAccount.value))
  }

  return {
    campaigns,
    loading,
    fetchCampaigns,
    createCampaign,
    donate,
    withdraw,
    refund,
    getContribution,
  }
})
