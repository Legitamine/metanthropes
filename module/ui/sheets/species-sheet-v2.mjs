const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
import gsap from "/scripts/greensock/esm/all.js";
/**
 * ApplicationV2 sheet for metaSpecies Items.
 *
 * @export
 * @class MetanthropesSpeciesSheetV2
 * @typedef {MetanthropesSpeciesSheetV2}
 * @extends {HandlebarsApplicationMixin(ItemSheetV2)}
 */
export class MetanthropesSpeciesSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {
	static DEFAULT_OPTIONS = {
		classes: ["metanthropes", "species-sheet"],
		tag: "form",
		position: {
			width: 650,
			height: "auto",
		},
		form: {
			closeOnSubmit: false,
			submitOnChange: false,
			submitOnClose: false,
		},
		actions: {
			saveAndClose: MetanthropesSpeciesSheetV2.#onSaveAndClose, //? can do this instead of this.
		},
		window: {
			resizable: false,
			//? break down for content only tabs
			contentClasses: ["standard-form", "species-sheet-content"],
		},
	};

	static PARTS = {
		header: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/header.hbs",
		},
		tabs: {
			template: "templates/generic/tab-navigation.hbs",
		},
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
		footer: {
			template: "systems/metanthropes/templates/apps/sheets/item/species/footer.hbs",
		},
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
	 * Save & Close the app
	 *
	 * @static
	 */
	static async #onSaveAndClose(event, target) {
		await this.submit();
		await this.close();
	}

	/**
	 * Prepare rendering context.
	 *
	 * @param {ApplicationRenderOptions} options
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.isNarrator = game.user.isGM;
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

	/**
	 * Change Sheet Tabs with an animation
	 *
	 * @param {*} tab
	 * @param {*} group
	 * @param {{}} [options={}]
	 */
	changeTab(tab, group, options = {}) {
		const changeOptions = {
			...options,
			updatePosition: options.updatePosition ?? true,
		};
		//* GSAP animation
		//? Clean up previous animations still in progress
		this._tabAnimation?.kill();
		this._tabAnimation = null;
		//? Skip the animation if photosensitiveMode is enabled
		if (game.settings.get("core", "photosensitiveMode")) {
			this._tabAnimation?.kill();
			this._tabAnimation = null;
			return super.changeTab(tab, group, changeOptions);
		}
		const previousTab = this.tabGroups[group];
		const clearProps = { clearProps: "opacity,visibility,transform,overflow" };
		const panels = [...this.element.querySelectorAll(".tab")].filter((panel) => panel.dataset.group === group);
		const previousPanel = panels.find((panel) => panel.dataset.tab === previousTab);
		const nextPanel = panels.find((panel) => panel.dataset.tab === tab);
		gsap.set(panels, clearProps);
		//? Fallback if panels break or clicking on the same tab
		if (!previousPanel || !nextPanel || previousPanel === nextPanel) {
			return super.changeTab(tab, group, changeOptions);
		}
		//? Animation states
		const collapsed = {
			autoAlpha: 0,
			scaleY: 0,
			y: -40,
			transformOrigin: "top center",
			overflow: "hidden",
		};
		const expanded = {
			autoAlpha: 1,
			scaleY: 1,
			y: 0,
			duration: 0.33,
			ease: "power2.out",
		};
		//? Timeline
		this._tabAnimation = gsap.timeline({
			onComplete: () => {
				this._tabAnimation = null;
			},
		});
		//? Animation
		this._tabAnimation
			.to(previousPanel, {
				...collapsed,
				duration: 0.33,
				ease: "power2.in",
			})
			.set(previousPanel, clearProps)
			.call(() => {
				super.changeTab(tab, group, changeOptions);
			})
			.set(nextPanel, collapsed)
			.to(nextPanel, expanded);
	}
}
