import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CrowdFundModule", (m) => {
  const goal = m.getParameter("goal", 1000000000000000000n); // 1 ether

  const crowdFund = m.contract("CrowdFund", [goal]);

  return { crowdFund };
});