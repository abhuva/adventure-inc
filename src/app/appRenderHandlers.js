import { renderAppSections } from "../ui/renderApp.js";

export function createAppRenderHandlers({
  headerRenderAdapter,
  mapRenderAdapter,
  rosterRenderAdapter,
  dungeonRenderAdapter,
  expeditionRenderAdapter,
  templeRenderAdapter,
  systemsRenderAdapter,
  eventRenderAdapter
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

  function renderEncounter() {
    eventRenderAdapter.renderEncounter();
  }

  function renderContinent() {
    expeditionRenderAdapter.renderContinent();
  }

  function renderArrival() {
    expeditionRenderAdapter.renderArrival();
  }

  return {
    render() {
      renderAppSections({
        header: renderHeader,
        encounter: renderEncounter,
        map: renderMap,
        visitors: renderVisitors,
        jobs: renderJobs,
        parties: renderParties,
        roster: renderRoster,
        dungeon: renderDungeon,
        continent: renderContinent,
        temple: renderTemple,
        systems: renderSystems,
        arrival: renderArrival
      });
    },
    renderTimeTick(activeTab, hourFraction = 0, { dayRolledOver = false } = {}) {
      renderHeader();
      if (activeTab === "tavern" && dayRolledOver) {
        rosterRenderAdapter.renderVisitors();
      }
      if (activeTab === "map") {
        mapRenderAdapter.renderMapActors(hourFraction);
      }
      if (activeTab === "population") {
        rosterRenderAdapter.renderJobs();
      }
      if (activeTab === "dungeon") {
        dungeonRenderAdapter.renderDungeonReplay();
      }
      if (activeTab === "roster") {
        rosterRenderAdapter.renderParties();
        rosterRenderAdapter.renderRoster();
      }
      if (activeTab === "continent") {
        expeditionRenderAdapter.renderContinent();
      }
      expeditionRenderAdapter.renderArrival();
    },
    renderArrival,
    renderContinent,
    renderDungeon,
    renderEncounter,
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
