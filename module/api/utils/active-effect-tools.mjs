/**
 *
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 *
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 *
 */
export function onManageActiveEffect(event, owner) {
	event.preventDefault();
	const a = event.currentTarget;
	const li = a.closest("li");
	const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
	switch (a.dataset.action) {
		case "create":
			return owner.createEmbeddedDocuments("ActiveEffect", [
				{
					name: "New Effect",
					icon: "systems/metanthropes/artwork/status-effects/metanthropes-logo.svg",
					origin: owner.uuid,
					"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
					disabled: li.dataset.effectType === "inactive",
					flags: {
						metanthropes: {
							metaEffectType: "Undefined",
							metaEffectApplication: "Undefined",
							metaCycle: null,
							metaStartCycle: null,
						},
					},
				},
			]);
		case "edit":
			return effect.sheet.render(true);
		case "delete":
			return effect.delete();
		case "toggle":
			return effect.update({ disabled: !effect.disabled });
	}
}

/**
 *
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 *
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 *
 */
export function prepareActiveEffectCategories(effects) {
	//? Define effect header categories
	const categories = {
		temporary: {
			type: "temporary",
			label: "Active Effects",
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
	for (const e of effects) {
		if (e.disabled) categories.inactive.effects.push(e);
		else if (e.isTemporary) categories.temporary.effects.push(e);
		else categories.permanent.effects.push(e);
	}

	//? Sort each category
	for (const c of Object.values(categories)) {
		c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0));
	}

	return categories;
}
