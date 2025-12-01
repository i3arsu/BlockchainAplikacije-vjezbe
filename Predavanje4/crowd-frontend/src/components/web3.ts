import { ref } from "vue";
import { ethers } from "ethers";
import CrowdFundMulti from "../abi/MultiCrowdFund.json";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");

export const accounts = ref<any[]>([]);
export const selectedAccountIndex = ref<number>(0);

export let contract: ethers.Contract | null = null;
let signer: ethers.Signer | null = null;

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // zamijeni nakon deploya

// --- Init funkcija ---
export async function init() {
  accounts.value = await provider.listAccounts();
  selectedAccountIndex.value = 0;
  signer = await provider.getSigner(selectedAccountIndex.value);
  contract = new ethers.Contract(contractAddress, CrowdFundMulti.abi, signer);

  console.log("Initialized contract with account:", accounts.value[selectedAccountIndex.value]);
}

export async function switchAccount(index: number) {
  if (index < 0 || index >= accounts.value.length) return;

  selectedAccountIndex.value = index;
  signer = await provider.getSigner(index);
  contract = new ethers.Contract(contractAddress, CrowdFundMulti.abi, signer);

  console.log("Switched to account:", accounts.value[selectedAccountIndex.value]);
}

// --- Campaign list ---
export const campaigns = ref<any[]>([]);

export async function fetchCampaigns() {
  if (!contract) return;

  const nextId: number = Number(await contract.nextCampaignId());
  const list: any[] = [];

  for (let id = 0; id < nextId; id++) {
    const c = await contract.campaigns(id);
    list.push({
      id,
      owner: c.owner,
      title: c.title,
      goal: Number(c.goal),
      deadline: Number(c.deadline),
      totalRaised: Number(c.totalRaised),
      liveBalance: Number(c.liveBalance),
      goalReached: c.goalReached,
      fundsWithdrawn: c.fundsWithdrawn,
    });
  }

  campaigns.value = list;
}
