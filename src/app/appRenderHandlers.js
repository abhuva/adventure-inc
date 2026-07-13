import { renderAppSections } from "../ui/renderApp.js";

export function createAppRenderHandlers({
  headerRenderAdapter,
  mapRenderAdapter,
  rosterRenderAdapter,
  dungeonRenderAdapter,
  templeRenderAdapter,
  systemsRenderAdapter
}) {
  function renderHeader() {
    headerRenderAdapter.renderHeader();
  }

  function renderMap() {
    mapRenderAdapter.renderMap();
  }

  function renderVisitors() {
    rosterRenderAdapter.renderVisitors();
  }

  function renderJobs() {
    rosterRenderAdapter.renderJobs();
  }

  function renderParties() {
    rosterRenderAdapter.renderParties();
  }

  function renderRoster() {
    rosterRenderAdapter.renderRoster();
  }

  function renderDungeon() {
    dungeonRenderAdapter.renderDungeon();
  }

  function renderTemple() {
    templeRenderAdapter.renderTemple();
  }

  function renderSystems() {
    systemsRenderAdapter.renderSystems();
  }

  return {
    render() {
      renderAppSections({
        header: renderHeader,
        map: renderMap,
        visitors: renderVisitors,
        jobs: renderJobs,
        parties: renderParties,
        roster: renderRoster,
        dungeon: renderDungeon,
        temple: renderTemple,
        systems: renderSystems
      });
    },
    renderDungeon,
    renderDungeonReplay() {
      dungeonRenderAdapter.renderDungeonReplay();
    },
    renderHeader,
    renderJobs,
    renderMap,
    renderMapActors(hourFraction = 0) {
      mapRenderAdapter.renderMapActors(hourFraction);
    },
    renderLocationDetail() {
      mapRenderAdapter.renderLocationDetail();
    },
    renderParties,
    renderRoster,
    renderSystems,
    renderTemple,
    renderVisitors
  };
}
