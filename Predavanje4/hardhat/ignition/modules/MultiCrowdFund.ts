import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

export default buildModule("MultiCrowdFundModule", (m) => {

    const multiCrowdFund = m.contract("MultiCrowdFund");
    m.call(multiCrowdFund, "createCampaign", ["Inicijalna kampanja", ethers.parseEther("5"), 60]);
    
    return { multiCrowdFund };
})