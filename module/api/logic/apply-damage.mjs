
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
	metanthropes.utils.metaLog(3, "metaApplyDamage", "Targets:", targets);
	for (let i = 0; i < targets.length; i++) {
		const targetedActor = await fromUuid(targets[i]);
		await targetedActor.applyDamage(cosmicDamage, elementalDamage, materialDamage, psychicDamage);
		metanthropes.utils.metaLog(
			3,
			"metaApplyDamage",
			"Applying Damage to",
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
