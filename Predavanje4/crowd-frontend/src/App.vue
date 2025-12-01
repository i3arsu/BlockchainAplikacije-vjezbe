<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { init } from './components/web3';
import CrowdFund from './components/CrowdFund.vue';
import CampaignList from './components/CampaignList.vue';
import CreateCampaign from './components/CreateCampaign.vue';
import { accounts, switchAccount, selectedAccountIndex } from './components/web3';

const ready = ref(false);

onMounted(async () => {
  await init();
  ready.value = true;
});
</script>

<template>
  <div v-if="ready">
    <h3>Active account: {{ accounts[selectedAccountIndex].address }}</h3>
    <select v-model="selectedAccountIndex" @change="switchAccount(selectedAccountIndex)">
      <option v-for="(acc, idx) in accounts" :value="idx" :key="acc">
        {{ acc.address }}
      </option>
    </select>


    <CreateCampaign />
    <CampaignList />
  </div>

  <div v-else>
    <h2>Loading...</h2>
  </div>
</template>