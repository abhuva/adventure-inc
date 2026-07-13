import {
  applyRewards,
  canPay,
  payCost
} from "../game/resources/resourceRewards.js";

export function createResourceRuntime({ state }) {
  return {
    canPay(cost) {
      return canPay(state.resources, cost);
    },
    pay(cost) {
      payCost(state.resources, cost);
    },
    applyRewards(rewards = {}) {
      applyRewards(state, rewards);
    }
  };
}
