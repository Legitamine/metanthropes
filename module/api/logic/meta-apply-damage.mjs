/**
 * metaApplyDamage - Apply damage to an array of targets.
 *
 * @export
 * @async
 * @param {Array} targetsUUIDs
 * @param {number} [cosmicDamage=0]
 * @param {number} [elementalDamage=0]
 * @param {number} [materialDamage=0]
 * @param {number} [psychicDamage=0]
 * @returns {*}
 */
export async function metaApplyDamage(
	targetsUUIDs,
	cosmicDamage = 0,
	elementalDamage = 0,
	materialDamage = 0,
	psychicDamage = 0
) {
	for (let i = 0; i < targetsUUIDs.length; i++) {
		const targetedActor = await fromUuid(targetsUUIDs[i]);
		metanthropes.utils.metaLog(
			3,
			"metaApplyDamage",
			"Applying Damage to",
			i+1,
			"of",
			targetsUUIDs.length,
			`Target${targetsUUIDs.length>1?'s':''}:`,
			targetedActor.name,
			"Cosmic:",
			cosmicDamage,
			"Elemental:",
			elementalDamage,
			"Material:",
			materialDamage,
			"Psychic:",
			psychicDamage
		);
		await targetedActor.applyDamage(cosmicDamage, elementalDamage, materialDamage, psychicDamage);
	}
}
