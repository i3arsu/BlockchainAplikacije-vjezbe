import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CrowdFundModule", (m) => {

    const crowdFund = m.contract("CrowdFund",[15_000_000_000_000_000n, 10]);
    m.call(crowdFund, "donate", [], { value: 1_000_000_000_000_000n });
    
    return { crowdFund };
})