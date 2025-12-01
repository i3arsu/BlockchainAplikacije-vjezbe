<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
// @ts-ignore: Allow importing JSON ABI without resolveJsonModule
import abi from "../abi/CrowdFund.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- update!

// State values
let provider: ethers.JsonRpcProvider;
let signer: ethers.Signer;
let contract!: ethers.Contract;

const goal = ref("");
const totalRaised = ref("");
const timeLeft = ref(0);
const isGoalReached = ref(false);
const isFundsWithdrawn = ref(false);

const donors = ref<{ donor: string; amount: string }[]>([]);
const donationEth = ref("0");

// --- Init Blockchain + Load State ---
async function init() {
  provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  signer = await provider.getSigner(0);
  contract = new ethers.Contract(contractAddress, abi.abi, signer);

  await refreshData();
}

// --- Load All Contract State ---
async function refreshData() {
    if (!contract) return;
    const [_goal, _total, _deadline, _goalReached, _withdrawn] =
        await Promise.all([
        contract.goal(),
        contract.totalRaised(),
        contract.deadline(),
        contract.goalReached(),
        contract.fundsWithdrawn(),
        ]);

  goal.value = ethers.formatEther(_goal);
  totalRaised.value = ethers.formatEther(_total);
  isGoalReached.value = _goalReached;
  isFundsWithdrawn.value = _withdrawn;

  const now = Math.floor(Date.now() / 1000);
  timeLeft.value = Number(_deadline) > now ? Number(_deadline) - now : 0;

  await loadDonors();
}

async function loadDonors() {
  const list = await contract.getDonors();
  donors.value = list.map((d: any) => ({
    donor: d.donor,
    amount: ethers.formatEther(d.amount),
  }));
}

// --- Contract Actions ---
async function donate() {
  if (!contract) return;
  const tx = await contract.donate({
    value: ethers.parseEther(donationEth.value),
  });
  await tx.wait();
  await refreshData();
}

async function withdrawFunds() {
  const tx = await contract.withdrawFunds();
  await tx.wait();
  await refreshData();
}

async function refund() {
  const tx = await contract.refund();
  await tx.wait();
  await refreshData();
}

onMounted(init);
</script>

<template>
  <div class="cf-container">

    <h2>🎯 CrowdFund Campaign</h2>

    <p><strong>Goal:</strong> {{ goal }} ETH</p>
    <p><strong>Total Raised:</strong> {{ totalRaised }} ETH</p>

    <p v-if="timeLeft > 0">
      ⏳ Time remaining: {{ (timeLeft / 60).toFixed(2) }} min
    </p>
    <p v-else>⛔ Campaign Ended</p>

    <!-- Donate Form -->
    <div v-if="timeLeft > 0" class="donate-box">
      <input
        v-model="donationEth"
        placeholder="Amount (ETH)"
        type="number"
        min="0.01"
      />
      <button @click="donate">Donate</button>
    </div>

    <!-- Post-campaign actions -->
    <div v-if="timeLeft === 0">
      <button
        v-if="isGoalReached && !isFundsWithdrawn"
        @click="withdrawFunds"
      >
        Withdraw Funds
      </button>

      <button
        v-if="!isGoalReached"
        @click="refund"
      >
        Refund My Donation
      </button>
    </div>

    <!-- Donor List -->
    <h3>Donors</h3>
    <ul v-if="donors.length">
      <li v-for="d in donors" :key="d.donor">
        {{ d.donor }} → {{ d.amount }} ETH
      </li>
    </ul>
    <p v-else>No donations yet</p>

  </div>
</template>

<style scoped>
.cf-container {
  padding: 20px;
  max-width: 450px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.donate-box {
  margin: 12px 0;
  display: flex;
  gap: 8px;
}

button {
  padding: 7px 12px;
  cursor: pointer;
}
</style>