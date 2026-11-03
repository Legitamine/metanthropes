/**
 * @import { DamageConfig } from "../data/actors/_types.d.ts";
 */

/**
 * Register metanthropes queries.
 */
export default function registerQueries() {
  CONFIG.queries[metanthropes.system.id] = function({ type, ...queryOptions }) {
    switch (type) {
      case "applyDamage":
        return applyDamage(queryOptions);
      default:
        throw new Error(`Type '${type}' is not a registered query.`);
    }
  }
}

/* -------------------------------------------------- */

/**
 * Apply damage to a specific actor.
 * @param {{ actorUuids: string[]; damages: DamageConfig[] }} queryOptions
 * @returns {Promise<void>}   A promise that resolves once damage has been applied.
 */
async function applyDamage({ actorUuids, damages }) {
  const operations = [];
  const actors = new Set();
  for (const uuid of actorUuids) {
    const actor = await fromUuid(uuid);
    if (!actor || actors.has(actor)) continue;
    const operation = actor.system._applyDamageOperation(damages);
    operations.push(operation);
    actors.add(actor);
  }
  await foundry.documents.modifyBatch(operations);
  return Array.from(actors).map(actor => actor.uuid);
}
