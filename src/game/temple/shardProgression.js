export function recordShardProgress(templeState, estimate, shards, addShardXp) {
  const awards = [];
  templeState.dungeonVisits[estimate.dungeonId] = (templeState.dungeonVisits[estimate.dungeonId] || 0) + 1;
  awards.push(...awardDueShards(shards, estimate.dungeonId, "visit", templeState.dungeonVisits[estimate.dungeonId], addShardXp));
  if (estimate.success) {
    templeState.bossVisits[estimate.dungeonId] = (templeState.bossVisits[estimate.dungeonId] || 0) + 1;
    awards.push(...awardDueShards(shards, estimate.dungeonId, "boss", templeState.bossVisits[estimate.dungeonId], addShardXp));
  }
  return awards;
}

export function dueShardAwards(shards, dungeonId, dropType, counter) {
  return Object.entries(shards)
    .filter(([, shard]) => shard.dungeonId === dungeonId && shard.dropType === dropType && counter % shard.dropEvery === 0)
    .map(([shardId, shard]) => ({ shardId, shard, amount: 1, dropType, counter }));
}

export function awardDueShards(shards, dungeonId, dropType, counter, addShardXp = null) {
  const awards = dueShardAwards(shards, dungeonId, dropType, counter);
  if (addShardXp) {
    awards.forEach((award) => addShardXp(award.shardId, award.amount));
  }
  return awards;
}

export function addShardXp(templeState, shardId, amount) {
  const current = templeState.shardInventory[shardId]?.xp || 0;
  templeState.shardInventory[shardId] = { xp: current + amount };
  templeState.selectedShardId = shardId;
  return { shardId, previousXp: current, xp: current + amount, wasNew: current <= 0 };
}
