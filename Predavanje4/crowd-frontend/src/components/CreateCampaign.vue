<template>
  <div class="create-campaign p-4 bg-white border rounded shadow-md max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">Create a New Campaign</h2>

    <label class="block mb-2">Title:</label>
    <input
      v-model="title"
      type="text"
      class="border px-2 py-1 mb-3 w-full"
      placeholder="Campaign title"
    />

    <label class="block mb-2">Goal (ETH):</label>
    <input v-model="goalEth" type="string" class="border px-2 py-1 mb-3 w-full" placeholder="0.5" />

    <label class="block mb-2">Duration (minutes):</label>
    <input
      v-model="durationMinutes"
      type="number"
      class="border px-2 py-1 mb-3 w-full"
      placeholder="120"
    />

    <button @click="create" class="px-4 py-2 bg-blue-600 text-white rounded w-full">
      Create Campaign
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignStore } from '../stores/campaignStore'

const campaignStore = useCampaignStore()

const title = ref('')
const goalEth = ref('')
const durationMinutes = ref(60)

async function create() {
  if (!title.value || !goalEth.value) return

  await campaignStore.createCampaign(title.value, goalEth.value, Number(durationMinutes.value))

  // Clear after creation
  title.value = ''
  goalEth.value = ''
  durationMinutes.value = 60

  alert('Campaign created!')
}
</script>

<style scoped>
.create-campaign {
  margin-top: 20px;
}
</style>
