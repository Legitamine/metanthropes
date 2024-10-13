
/**
 * Function to define Metanthropes Status Effects
 *
 * @export
 */
export function metaRegisterStatusEffects() {

	const idsToKeep = [];
	
	CONFIG.statusEffects = CONFIG.statusEffects.filter((item) => idsToKeep.includes(item.id));
	
	const metaStatusEffects = [

		//* Invisible
		{
			id: "invisible",
			name: "Invisible",
			flags: {
				metanthropes: {
					metaEffectType: "Buff",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Invisible</p>",
			img: "systems/metanthropes/assets/artwork/status-effects/invisible.svg",
		},

		//* Sense-Lost: Vision
		{
			id: "blind",
			name: "Sense-Lost: Vision",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Sense-Lost: Vision</p>",
			img: "systems/metanthropes/assets/artwork/status-effects/sense-lost-vision.svg",
		},

		//* Dead
		{
			id: "dead",
			name: "Dead",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Cover",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			description: "<p>Dead</p>",
			img: "systems/metanthropes/assets/artwork/status-effects/dead.svg",
		},

		//* Knocked Down
		{
			id: "knockeddown",
			name: "Knocked Down",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Movement",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			changes: [
				{
					key: "system.physical.movement.Conditions.knockdown.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: true,
				},
			],
			description: "<p>Knocked Down</p>",
			img: "systems/metanthropes/assets/artwork/status-effects/knocked-down.svg",
		},

		//* Immobilized
		{
			id: "immobilized",
			name: "Immobilized",
			flags: {
				metanthropes: {
					metaEffectType: "Condition",
					metaEffectApplication: "Movement",
					metaCycle: null,
					metaRound: null,
					metaStartCycle: null,
					metaStartRound: null,
				},
			},
			changes: [
				{
					key: "system.physical.movement.Conditions.immobilized.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: true,
				},
				{
					key: "system.physical.movement.value",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					value: 0,
				},
			],
			description: "<p>Immobilized</p>",
			img: "systems/metanthropes/assets/artwork/status-effects/immobilized.svg",
		},
	];

	CONFIG.statusEffects.push(...metaStatusEffects);
}
