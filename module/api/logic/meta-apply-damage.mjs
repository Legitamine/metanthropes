/**
 * metaApplyDamage - Apply damage to an array of targets.
 *
 * @export
 * @async
 * @param {Array} targets
 * @param {number} [cosmicDamage=0]
 * @param {number} [elementalDamage=0]
 * @param {number} [materialDamage=0]
 * @param {number} [psychicDamage=0]
 * @returns {*}
 */
export async function metaApplyDamage(
	targets,
	cosmicDamage = 0,
	elementalDamage = 0,
	materialDamage = 0,
	psychicDamage = 0
) {
	for (let i = 0; i < targets.length; i++) {
		const targetedActor = await fromUuid(targets[i]);
		await targetedActor.applyDamage(cosmicDamage, elementalDamage, materialDamage, psychicDamage);
		metanthropes.utils.metaLog(
			3,
			"metaApplyDamage",
			"Applying Damage to",
			i+1,
			"of",
			targets.length,
			`Target${targets.length>1?'s':''}:`,
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
	}
}
