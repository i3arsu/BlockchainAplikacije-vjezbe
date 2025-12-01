<script setup lang="ts">
import { ref } from "vue";
import { contract, fetchCampaigns} from "./web3";

const title = ref("");
const goal = ref(0);
const duration = ref(5);

async function create() {
    if (!contract) {
        console.error("Contract not initialized");
        return;
    }

  const tx = await contract.createCampaign(title.value, goal.value, duration.value);
  await tx.wait();
  await fetchCampaigns();
  title.value = "";
  goal.value = 0;
}
</script>

<template>
  <div>
    <h2>Create Campaign</h2>
    <input v-model="title" placeholder="Title" />
    <input v-model="goal" type="number" placeholder="Goal (wei)" />
    <input v-model="duration" type="number" placeholder="Duration (min)" />
    <button @click="create">Create</button>
  </div>
</template>
