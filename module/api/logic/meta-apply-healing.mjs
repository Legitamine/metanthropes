
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
	for (let i = 0; i < targets.length; i++) {
		const targetedActor = await fromUuid(targets[i]);
		metanthropes.utils.metaLog(
			3,
			"metaApplyHealing",
			"Applying Healing to",
			i+1,
			"of",
			targets.length,
			`Target${targets.length>1?'s':''}:`,
			targetedActor.name,
			"Healing:",
			healing
		);
		await targetedActor.applyHealing(healing);
	}
}
