<script setup lang="ts">
import { ref, computed } from "vue";
import { campaigns, fetchCampaigns, contract, accounts, selectedAccountIndex } from "./web3";
import { ContractFactory } from "ethers";

const amount = ref(0);

// Dobijemo trenutno aktivni account
const activeAccount = computed(() => accounts[selectedAccountIndex.value]);
console.log("Active account:", activeAccount.value);

// Doniraj u kampanju s trenutnim accountom
async function donate(id: number) {
  if (!contract) return;

  try {
    const tx = await contract.donateTo(id, { value: amount.value });
    await tx.wait();
    amount.value = 0;
    await fetchCampaigns();
  } catch (err) {
    console.error("Donation error:", err);
  }
}

// Dohvati koliko je trenutno odabrani account donirao kampanji
async function getContribution(id: number): Promise<number> {
  if (!contract) return 0;
  try {
    const bal = await contract.contributions(id ,activeAccount);
    return Number(bal);
  } catch (err) {
    console.error(err);
    return 0;
  }
}
</script>

<template>
  <div>
    <h2>Campaigns</h2>
    <button @click="fetchCampaigns">Refresh</button>

    <div v-for="c in campaigns" :key="c.id" style="border:1px solid #aaa;padding:10px;margin:8px;">
      <h3>{{ c.title }}</h3>
      <p>Goal: {{ c.goal }} wei</p>
      <p>Raised: {{ c.totalRaised }} wei</p>
      <p>Status: {{ c.goalReached ? 'Goal reached!' : 'In progress' }}</p>

      <!-- Prikaz koliko je trenutno odabrani account donirao -->
      <p>My contribution: 
        <span>{{ getContribution(c.id)}}</span> wei
      </p>

      <input v-model.number="amount" type="number" placeholder="Donate in wei" />
      <button @click="donate(c.id)">Donate</button>
    </div>
  </div>
</template>

<script lang="ts">

export function asyncValue(promise: Promise<any>) {
  const val = ref("loading...");
  promise.then(r => val.value = r).catch(() => val.value = "error");
  return val;
}
</script>
