import {
  awardDueShards as awardDueShardsForTemple,
  recordShardProgress as recordShardProgressForTemple
} from "../game/temple/shardProgression.js";

export function createTempleProgressionHandlers({
  templeState,
  shards,
  addShardXp
}) {
  return {
    recordShardProgress(estimate) {
      return recordShardProgressForTemple(templeState, estimate, shards, addShardXp);
    },
    awardDueShards(dungeonId, dropType, counter) {
      return awardDueShardsForTemple(shards, dungeonId, dropType, counter, addShardXp);
    }
  };
}
