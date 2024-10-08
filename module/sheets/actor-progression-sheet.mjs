/**
 * 
 * MetanthropesActorProgressionSheet extends ActorSheet and is used for the Progression tab of the Actor sheet.
 * 
 */
export class MetanthropesActorProgressionSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "metanthropes-actor-progression-sheet",
			classes: ["metanthropes", "progression", "sheet", "actor"],
			width: 1012,
			height: 700,
			tabs: [
				{
					navSelector: ".progressionnavselector",
					contentSelector: ".progressionnavtabs",
					initial: "progression-overview",
				},
			],
			sheetConfig: false,
			closeOnSubmit: false,
			submitOnClose: false,
			submitOnChange: true,
			resizable: true,
			minimizable: true,
		});
	}
	/** @override */
	get template() {
		return `systems/metanthropes/templates/progression/progression-sheet.hbs`;
	}
	/** @override */
	get title() {
		return this.actor.isToken
			? `Progression for [Token] ${this.actor.name} - ${this.actor.type}`
			: `Progression for ${this.actor.name} - ${this.actor.type}`;
	}
	/** @override */
	async close(options = {}) {
		await super.close(options);
		await this.actor.setFlag("metanthropes", "Progression", { isProgressing: false });
	}
	/** @override */
	getData(options = {}) {
		const context = super.getData(options);
		//? Use a safe clone of the actor data for further operations.
		//const actorData = this.actor.toObject(false);
		const actorData = this.object;
		//? Add the actor's system attributes and flages to the context for easier access.
		context.system = actorData.system;
		context.flags = actorData.flags;
		//? Prepare items - this will produce .Metapowers and .Possessions where applicable
		//todo break it down to metapowers and possessions so I can get better filtering by actor.type (?)
		if (actorData.type !== "Animal") {
			this._prepareMetapowers(context);
		}
		////? This will create the .RollStats object under .system that is used by Handlebars in the actor sheet for rolling
		//this.actor.getRollData();
		//! Prepare active effects - causes error when enabled - prepareActiveEffectCategories is not defined
		//! it needs effects.mjs from https://gitlab.com/asacolips-projects/foundry-mods/boilerplate/-/blob/master/module/helpers/effects.mjs?ref_type=heads
		// context.effects = prepareActiveEffectCategories(this.actor.effects);
		//? Provide a boolean for if the user is a Narrator(GameMaster)
		context.isGM = game.user.isGM;
		game.system.api.utils.metaLog(4, "MetanthropesActorProgressionSheet getData", "this, context, options", this, context, options);
		return context;
	}
	//* Activate listeners
	activateListeners(html) {
		super.activateListeners(html);
		//? Render the item sheet for viewing/editing prior to the editable check.
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});
		//* Everything below this point is only needed if the sheet is editable
		//? Observers (non-owners) of the item sheet, should not be able to roll anything, or add/remove items
		if (!this.isEditable) return;
		//? Add Inventory Item
		html.find(".item-create").click(this._onItemCreate.bind(this));
		//? Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});
		//!? Drag events for macros !??
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
		//? Listen for changes in the Overview tab
		html.find('select[name^="actor.system.Characteristics"]').change((event) =>
			this._onOverviewProgressionChange(event)
		);
		//? Listen for changes in the Perk tab
		html.find('select[name^="actor.system.Perks"]').change((event) => this._onPerkProgressionChange(event));
	}
	//! is this being used?
	// code from boilerplate
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system["type"];
		// Finally, create the item!
		return await Item.create(itemData, { parent: this.actor });
	}
	//* Prepare items
	_prepareMetapowers(context) {
		//? Initialize container
		const Metapowers = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
		};
		//? Iterate through items, allocating to containers
		for (let i of context.items) {
			//! Why do I need this line?
			i.img = i.img || DEFAULT_TOKEN;
			//? Append to Metapowers.
			if (i.type === "Metapower") {
				if (i.system.Level.value != undefined) {
					Metapowers[i.system.Level.value].push(i);
				}
			}
		}
		//? Assign and return
		context.Metapowers = Metapowers;
	}
	//* Handle changes from Overview tab
	_onOverviewProgressionChange(event) {
		event.preventDefault();
		game.system.api.utils.metaLog(3, "MetanthropesProgressionForm", "_onOverviewProgressionChange(event):", event);
		//? Extract actor data from the form, using our custom function
		const actorData = metaExtractFormData(event.currentTarget.form);
		game.system.api.utils.metaLog(3, "MetanthropesProgressionForm", "_onOverviewProgressionChange", "actorData:", actorData);
		//? Use a method similar to _prepareDerivedCharacteristicsData to recalculate experience
		this._recalculateOverviewExperience(actorData);
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Handle changes from Perks tab
	_onPerkProgressionChange(event) {
		event.preventDefault();
		game.system.api.utils.metaLog(3, "MetanthropesProgressionForm", "_onPerkProgressionChange(event)", event);
		//	//? Extract actor data from the form, using our custom function and merge it with the existing progress
		//	const progressionFormData = metaExtractFormData(event.currentTarget.form);
		//	game.system.api.utils.metaLog(3, "MetanthropesProgressionForm", "_onPerkProgressionChange", "progressionFormData:", progressionFormData);
		//	//? Adjust the keys in progressionFormData to remove the "actor." prefix
		//	const adjustedFormData = {};
		//	for (const [key, value] of Object.entries(progressionFormData)) {
		//		const adjustedKey = key.startsWith("actor.") ? key.slice(6) : key;
		//		adjustedFormData[adjustedKey] = value;
		//	}
		//	game.system.api.utils.metaLog(4, "MetaProgression", "_onPerkProgressionChange", "adjustedFormData:", adjustedFormData);
		//const progressionActorData = this.data.progressionActorData;
		//const mergedData = mergeObject(progressionActorData, adjustedFormData, { overwrite: true, recursive: true });
		//this.data.progressionActorData = mergedData
		//? Use a method similar to _prepareDerivedPerkXPData to recalculate experience
		//this._recalculatePerksExperience(mergedData);
		//? Update the displayed values in the dialog
		// this.render();
	}
	//* Handle changes from Overview tab
	_recalculateOverviewExperience(actorData) {
		game.system.api.utils.metaLog(4, "MetantropesProgressionForm", "_recalculateOverviewExperience", "actorData:", actorData);
		const systemData = actorData.system;
		let experienceSpent = 0;
		let characteristicExperienceSpent = 0;
		let statExperienceSpent = 0;
		let progressionCount = 0;
		let ifCharacteristicBecomesZeroPenalty = 0;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? reset ifCharacteristicBecomesZeroPenalty to 0
			ifCharacteristicBecomesZeroPenalty = 0;
			//? Calculate the progression count based on the characteristic's progressed value
			progressionCount = Number(CharValue.Progressed);
			//? Calculate the experience spent on this characteristic
			characteristicExperienceSpent = 0;
			for (let i = 0; i < progressionCount; i++) {
				characteristicExperienceSpent += Number((Number(CharValue.Initial) + Number(i * 5)) * 10);
			}
			//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
			if (progressionCount > 0) {
				experienceSpent += characteristicExperienceSpent;
			}
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the progression count based on the characteristic's progressed value
				progressionCount = Number(StatValue.Progressed);
				//? Calculate the experience spent on this characteristic
				statExperienceSpent = 0;
				for (let i = 0; i < progressionCount; i++) {
					statExperienceSpent += Number(
						(Number(StatValue.Initial) + Number(CharValue.Base) + Number(i * 5)) * 3
					);
				}
				//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
				if (progressionCount > 0) {
					experienceSpent += statExperienceSpent;
				}
			}
		}
		systemData.Vital.Experience.Spent = Number(experienceSpent);
		systemData.Vital.Experience.Stored = Number(
			Number(systemData.Vital.Experience.Total) -
				Number(experienceSpent) -
				Number(systemData.Vital.Experience.Manual)
		);
		//? Store the calculated values in a temporary object
		//! wtf chatGPT!?
		actorData.system.Vital.Experience.Spent = systemData.Vital.Experience.Spent;
		actorData.system.Vital.Experience.Stored = systemData.Vital.Experience.Stored;
		//? Update the displayed values in the dialog
		this.render();
	}
	_recalculatePerksExperience(progressionActorPerkData) {
		const progressionActor = progressionActorPerkData;
		game.system.api.utils.metaLog(
			5,
			"MetantropesProgressionForm",
			"_recalculatePerksExperience",
			"progressionActorPerkData:",
			progressionActorPerkData
		);
		const systemData = progressionActorPerkData.system;
		game.system.api.utils.metaLog(
			5,
			"MetantropesProgressionForm",
			"_recalculatePerksExperience",
			"progressionActorPerkData:",
			progressionActorPerkData
		);
		let startingPerks = Number(systemData.Perks.Details.Starting.value);
		let experienceAlreadySpent = Number(systemData.Vital.Experience.Spent);
		let experienceSpent = 0;
		let progressionCount = 0;
		let perkExperienceSpent = 0;
		//? Calculate the experience spent on Knowledge Perks
		for (const [KnowPerkKey, KnowPerkValue] of Object.entries(systemData.Perks.Knowledge)) {
			//? Calculate the progression count based on the perk's progressed value
			progressionCount = Number(KnowPerkValue.value);
			//? Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = progressionCount * 100;
			//? Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
		}
		//? Calculate the experience spent on Skills Perks
		for (const [SkillPerkKey, SkillPerkValue] of Object.entries(systemData.Perks.Skills)) {
			//? Calculate the progression count based on the perk's progressed value
			progressionCount = Number(SkillPerkValue.value);
			//? Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = progressionCount * 100;
			//? Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
		}
		//? Calculate total Experience Spent Progressing Perks & Characteristics & Stats
		//? test if we have spent enough xp on the starting perks
		if (experienceSpent < startingPerks * 100) {
			game.system.api.utils.metaLog(
				2,
				"MetantropesProgressionForm",
				"_recalculatePerksExperience",
				this.name,
				"needs to spend",
				startingPerks * 100,
				"total XP on perks"
			);
		}
		//? Update Experience Spent for Perks with exiting in systemData.Vital.Experience.Spent
		//? adding this to remove the xp calculated for spent xp on the starting perks
		//! TempStored
		parseInt(
			(progressionActor.progressionTempExperience.Spent =
				Number(experienceSpent) + Number(experienceAlreadySpent) - Number(startingPerks * 100))
		);
		parseInt(
			(progressionActor.progressionTempExperience.Stored = Number(
				Number(systemData.Vital.Experience.Total) -
					Number(experienceSpent) -
					Number(experienceAlreadySpent) +
					//? here we are adding the cost of free starting perks to the stored xp
					Number(startingPerks) * 100
			))
		);
		//? Store the calculated values in a temporary object
		//! wtf chatGPT!?
		//actorData.system.Vital.Experience.Spent = systemData.Vital.Experience.Spent;
		//actorData.system.Vital.Experience.Stored = systemData.Vital.Experience.Stored;
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Recalculate the total Experience spent and stored
	_validateAndStoreExperience(progressionActorData) {
		game.system.api.utils.metaLog(
			5,
			"MetantropesProgressionForm",
			"_validateAndStoreExperience",
			"progressionActorData:",
			progressionActorData
		);
		//	const systemData = actorData.system;
		//	//? Validate that stored experience is not negative
		//	if (systemData.Vital.Experience.Stored < 0) {
		//		//? Disable the Confirm button
		//		this.dialog.find('button[data-button="confirm"]').prop("disabled", true);
		//		//? Display a warning (you can customize this to fit your UI/UX)
		//		ui.notifications.warn("Stored Experience is Negative!");
		//	} else {
		//		//? Enable the Confirm button if it was previously disabled
		//		this.dialog.find('button[data-button="confirm"]').prop("disabled", false);
		//	}
		//	//? Use the temporary object to update the actor data
		//	if (this.tempExperienceValues) {
		//		this.actor.update(this.tempExperienceValues);
		//	}
	}
	_resetProgression() {
		game.system.api.utils.metaLog(3, "MetantropesProgressionForm", "_resetProgression", "Reseting Progression");
	}
}
