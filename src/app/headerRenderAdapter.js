import { renderHeaderView } from "../ui/headerView.js";

export function createHeaderRenderAdapter({
  state,
  el,
  documentRef,
  selectedParty
}) {
  function renderHeader() {
    renderHeaderView({
      el,
      state,
      party: selectedParty(),
      autoTimeButton: documentRef.getElementById("autoTimeBtn")
    });
  }

  return {
    renderHeader
  };
}
