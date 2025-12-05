<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWeb3Store } from './stores/web3'
// import CrowdFund from './components/CrowdFund.vue';
import CampaignList from './components/CampaignList.vue'
import CreateCampaign from './components/CreateCampaign.vue'

const ready = ref(false)
const web3Store = useWeb3Store()

onMounted(async () => {
  console.log('Initializing Web3...')
  await web3Store.init()
  ready.value = true
})
</script>

<template>
  <div v-if="ready">
    <h3>Active account: {{ web3Store.accounts[web3Store.selectedAccountIndex] }}</h3>
    <select
      v-model="web3Store.selectedAccountIndex"
      @change="web3Store.switchAccount(web3Store.selectedAccountIndex)"
    >
      <option v-for="(acc, idx) in web3Store.accounts" :value="idx" :key="acc">
        {{ acc }}
      </option>
    </select>

    <CreateCampaign />
    <CampaignList />
  </div>

  <div v-else>
    <h2>Loading...</h2>
  </div>
</template>
