/**
 * onManageActiveEffect calls manageActiveEffect based on the button clicked in the UI
 *
 * @export
 * @async
 * @param {MouseEvent} event
 * @param {*} target
 * @returns {*}
 */
export async function onManageActiveEffect(event, target) {
	event.preventDefault();
	const control = target ?? event.currentTarget;
	//const data = event.target.dataset;
	const data = control.dataset;
	metanthropes.utils.metaLog(1, "onManageActiveEffect", event, target);
	await manageActiveEffect({
		actorUUID: data.actoruuid,
		action: data.action,
		effectUUID: data.effectuuid,
		effectType: data.effectType,
	});
}

/**
 * manageActiveEffect handles the Active Effect controls called via buttons in the UI
 *
 * @export
 * @async
 * @param {{ actorUUID: string; action: string; effectUUID: string; effectType: string; }} param0
 * @param {*} param0.actorUUID
 * @param {*} param0.action
 * @param {*} param0.effectUUID
 * @param {*} param0.effectType
 * @returns {unknown}
 */
export async function manageActiveEffect({ actorUUID, action, effectUUID, effectType }) {
	const actor = await fromUuid(actorUUID);
	if (!actor) return metanthropes.utils.metaLog(2, "manageActiveEffect", "Could not find actor from UUID", actorUUID);
	//? Handle creation separately from other actions
	if (action === "effectCreate") {
		const effectData = {
			name: "New Effect",
			img: "systems/metanthropes/assets/logos/metanthropes-logo.webp",
			origin: actorUUID,
			disabled: effectType === "inactive",
			flags: { metanthropes: {} },
		};
		if (effectType === "temporary") {
			effectData.duration = { value: 1, units: "rounds", expiry: "roundEnd" };
			effectData.start = CONFIG.ActiveEffect.documentClass.getEffectStart();
		}
		return foundry.documents.ActiveEffect.implementation.createDocuments([effectData], { parent: actor });
	}
	//? Other actions require to have the correct effect
	const effect = effectUUID ? await fromUuid(effectUUID) : null;
	if (!effect)
		return metanthropes.utils.metaLog(2, "manageActiveEffect", "Could not find effect from UUID", effectUUID);
	switch (action) {
		case "effectEdit":
			return effect.sheet.render({ force: true });
		case "effectToggle":
			return effect.update({ disabled: !effect.disabled });
		case "effectRefresh":
			return effect.update({
				start: effect.constructor.getEffectStart(),
				"duration.expired": false,
			});
		case "effectDelete":
			return effect.delete();
		default:
			return metanthropes.utils.metaLog(
				2,
				"manageActiveEffect",
				"Not a valid Action",
				action,
				"for",
				effectType,
				"Active Effect UUID",
				effectUUID,
			);
	}
}

/**
 * prepareActiveEffectCategories organizes the Active Effects for the UI
 *
 * @export
 * @param {array} effects - An array of Active Effects to categorize
 * @returns {*}
 */
export function prepareActiveEffectCategories(effects) {
	//? Define effect header categories
	const categories = {
		temporary: {
			type: "temporary", //todo temporary einai defined kapoy?
			label: "Temporary Effects",
			effects: [],
		},
		permanent: {
			type: "permanent",
			label: "Permanent Effects",
			effects: [],
		},
		inactive: {
			type: "inactive",
			label: "Inactive Effects",
			effects: [],
		},
	};
	//? Iterate over active effects, classifying them into categories
	for (const effect of effects) {
		effect.updateDuration();
		if (!effect.active) categories.inactive.effects.push(effect);
		else if (effect.isTemporary) categories.temporary.effects.push(effect);
		else categories.permanent.effects.push(effect);
	}
	//? Sort each category, first by the sort value (so higher sort values are always first)
	//? then sort each alphabetically.
	for (const category of Object.values(categories)) {
		category.effects.sort(
			(a, b) =>
				(b.sort ?? 0) - (a.sort ?? 0) ||
				(a.name ?? "").localeCompare(b.name ?? "", undefined, {
					sensitivity: "base",
				}),
		);
	}
	return categories;
}
