<template>
  <div class="campaign-list">
    <h2 class="text-2xl font-bold mb-4">All Campaigns</h2>

    <div v-if="campaignStore.loading">Loading campaigns...</div>

    <div v-else>
      <div
        v-for="campaign in campaignStore.campaigns"
        :key="campaign.id"
        class="p-4 border rounded mb-4 bg-gray-100"
      >
        <h3 class="text-xl font-semibold">{{ campaign.title }}</h3>

        <p><strong>ID:</strong> {{ campaign.id }}</p>
        <p><strong>Owner:</strong> {{ campaign.owner }}</p>
        <p><strong>Goal:</strong> {{ campaign.goal }} wei</p>
        <p><strong>Total Raised:</strong> {{ campaign.totalRaised }} ETH</p>
        <p><strong>Live Balance:</strong> {{ campaign.liveBalance }} ETH</p>
        <p><strong>Deadline:</strong> {{ campaign.deadline }}</p>
        <p><strong>Goal Reached:</strong> {{ campaign.goalReached }}</p>
        <p><strong>Funds Withdrawn:</strong> {{ campaign.fundsWithdrawn }}</p>

        <div class="mt-3 flex gap-2">
          <!-- Donate -->
          <input v-model="donationAmount" placeholder="Amount in ETH" class="border px-2 py-1" />
          <button class="px-3 py-1 bg-blue-600 text-white rounded" @click="donateEth(campaign.id)">
            Donate
          </button>

          <!-- Withdraw (owner only) -->
          <button
            v-if="isOwner(campaign.owner)"
            class="px-3 py-1 bg-green-600 text-white rounded"
            @click="withdraw(campaign.id)"
          >
            Withdraw
          </button>

          <!-- Refund -->
          <button class="px-3 py-1 bg-red-600 text-white rounded" @click="refund(campaign.id)">
            Refund
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCampaignStore } from '../stores/campaignStore'
import { useWeb3Store } from '../stores/web3'

const web3 = useWeb3Store()
const campaignStore = useCampaignStore()

const donationAmount = ref('0.1')

// Load on mount
onMounted(async () => {
  await web3.init()
  await campaignStore.fetchCampaigns()
})

function donateEth(id: number) {
  if (!donationAmount.value) return
  campaignStore.donate(id, donationAmount.value)
}

function withdraw(id: number) {
  campaignStore.withdraw(id)
}

function refund(id: number) {
  campaignStore.refund(id)
}

function isOwner(ownerAddress: string) {
  if (!web3.accounts.length) return false
  return ownerAddress.toLowerCase() === web3.accounts[web3.selectedAccountIndex].toLowerCase()
}
</script>

<style scoped>
.campaign-list {
  max-width: 600px;
  margin: auto;
}
</style>
