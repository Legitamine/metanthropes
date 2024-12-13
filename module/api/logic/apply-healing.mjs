
/**
 * metaApplyHealing - Apply healing to an array of targets.
 *
 * @export
 * @async
 * @param {Array} targets - Array of actors
 * @param {number} healing - should be a positive number
 * @returns {*}
 */
export async function metaApplyHealing(targets, healing) {
	metanthropes.utils.metaLog(3, "metaApplyHealing", "Targets:", targets);
	for (let i = 0; i < targets.length; i++) {
		const targetedActor = targets[i];
		await targetedActor.applyHealing(healing);
		metanthropes.utils.metaLog(
			3,
			"metaApplyHealing",
			"Applying Healing to",
			targetedActor.name,
			"Healing:",
			healing
		);
	}
}
