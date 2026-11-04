/**
 * @import { DamageConfig } from "../../data/actors/_types.d.ts";
 */

/**
 * Apply damage to an array of targets.
 * @param {string[]} uuids
 * @param {DamageConfig[]} damages
 * @returns {Promise<void>}
 */
export async function metaApplyDamage(uuids, damages) {
  await game.user.query("metanthropes", { type: "applyDamage", actorUuids: uuids, damages });
}
