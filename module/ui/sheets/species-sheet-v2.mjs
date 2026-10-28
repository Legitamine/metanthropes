import { MetanthropesSheetV2 } from "./sheet-v2.mjs";
/**
 * ApplicationV2 sheet for metaSpecies Items.
 *
 * @export
 * @class MetanthropesSpeciesSheetV2
 * @typedef {MetanthropesSpeciesSheetV2}
 * @extends {MetanthropesSheetV2}
 */
export class MetanthropesSpeciesSheetV2 extends MetanthropesSheetV2 {
	static DEFAULT_OPTIONS = {
		classes: ["species-sheet"],
		position: {},
		form: {},
		actions: {},
		window: {
			contentClasses: ["species-sheet-content"],
		},
	};

	static PARTS = {
		header: super.PARTS.header,
		tabs: super.PARTS.tabs,
		summary: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/summary.hbs",
		},
		options: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/options.hbs",
		},
		resources: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/resources.hbs",
		},
		actions: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/actions.hbs",
		},
		characteristics: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/chars.hbs",
		},
		physical: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/physical.hbs",
		},
		defenses: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/defenses.hbs",
		},
		footer: super.PARTS.footer,
	};

	static TABS = {
		primary: {
			tabs: [
				{
					id: "summary",
					icon: "fas fa-page",
					label: "Summary",
				},
				{
					id: "options",
					icon: "fas fa-sliders",
					label: "Options",
				},
				{
					id: "resources",
					icon: "fas fa-heart",
					label: "Resources",
				},
				{
					id: "actions",
					icon: "fas fa-stopwatch",
					label: "Actions",
				},
				{
					id: "chars",
					icon: "fas fa-list-ol",
					label: "Characteristics",
				},
				{
					id: "physical",
					icon: "fas fa-ruler-combined",
					label: "Physical",
				},
				{
					id: "defenses",
					icon: "fas fa-shield",
					label: "Defenses",
				},
			],
			initial: "summary",
		},
	};

	/**
	 * Prepare rendering context.
	 *
	 * @param {ApplicationRenderOptions} options
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.energyTypes = metanthropes.system.TABLES.ENERGY;
		context.immunityTypes = metanthropes.system.TABLES.IMMUNITIES;
		const system = this.item.system;
		context.item = this.item;
		context.system = system;
		//* Enrichments
		const enricher = foundry.applications.ux.TextEditor.enrichHTML;
		context.enrichedSummaryDescription = await enricher(system.summary.description ?? "", {
			relativeTo: this.item,
			secrets: this.item.isOwner,
		});
		context.enrichedPhysicalDescription = await enricher(system.physical.description ?? "", {
			relativeTo: this.item,
			secrets: this.item.isOwner,
		});
		//* Fields definitions
		const getField = (path) => system.getFieldForProperty(path);
		context.speciesFields = {
			//* Summary
			//todo what else do we want here?
			summaryDescription: getField("summary.description"),
			origin: getField("summary.origin"),
			dimension: getField("summary.dimension"),
			//* Options
			allowLifeProgression: getField("options.allowLifeProgression"),
			allowDestiny: getField("options.allowDestiny"),
			allowPerks: getField("options.allowPerks"),
			allowPossessions: getField("options.allowPossessions"),
			allowMetapowers: getField("options.allowMetapowers"),
			targetTypes: getField("options.targetTypes"),
			forbidTemplates: getField("options.forbidTemplates"),
			//* Resources
			lifeInitial: getField("resources.life.initial"),
			lifeProgressionStep: getField("resources.life.progressionStep"),
			lifeProgressionGain: getField("resources.life.progressionGain"),
			destinyInitialBase: getField("resources.destiny.initialBase"),
			destinyInitialDice: getField("resources.destiny.initialDice"),
			//* Actions
			actionMain: getField("actions.main"),
			actionExtra: getField("actions.extra"),
			actionReaction: getField("actions.reaction"),
			//* Characteristics
			charPrimary: getField("chars.primary"),
			charSecondary: getField("chars.secondary"),
			charTertiary: getField("chars.tertiary"),
			//* Physical
			physicalDescription: getField("physical.description"),
			hitbox: getField("physical.hitbox"),
			speed: getField("physical.speed"),
			weight: getField("physical.weight"),
			size: getField("physical.size"),
			allowedMovementTypes: getField("physical.allowedMovementTypes"),
			//* Defenses
			resistances: getField("defenses.resistances"),
			immunities: getField("defenses.immunities"),
			cover: getField("defenses.cover"),
		};
		return context;
	}
}
