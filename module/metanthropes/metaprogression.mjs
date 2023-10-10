//!todo delete this if no longer needed from within helpers too!
import { metaExtractFormData } from "../helpers/metahelpers.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";

export async function openProgressionForm(progressionActorData) {
	metaLog(3, "openProgressionForm", "Engaged for progressionActorData:", progressionActorData);
	//? Define the dialog content
	const formContent = "Make sure that your Stored Experience is not negative before confirming!";
	//? Define the dialog buttons
	const formButtons = {
		confirm: {
			label: "Confirm 📈 Progression",
			callback: async (html) => {
				//? Extract actor data from the form
				//const formData = new FormData(html[0]);
				//const actorData = this._getFormData(formData);
				//? Validate the experience values
				this._validateAndStoreExperience(progressionActorData);
				//? If stored experience is not negative, update the actor
				//	if (this.tempExperienceValues["system.Vital.Experience.Stored"] >= 0) {
				//		await actorData.actor.update(this.tempExperienceValues);
				//	} else {
				//		//? Optionally, you can provide a notification or feedback to the user if the validation fails
				//		ui.notifications.warn("Please ensure Stored Experience is not negative before confirming.");
				//	}
				//!? warn on negative stored xp
				metaLog(
					5,
					"openProgressionForm",
					"on Confirm",
					"WARNING: Stored Experience is Negative for:",
					this.name
				);
			},
		},
		reset: {
			label: "Reset 📈 Progression",
			callback: () => {
				this._resetProgression();
				//	this.tempExperienceValues = {
				//		"system.Vital.Experience.Spent": this.data.actorData.actor.system.Vital.Experience.Spent,
				//		"system.Vital.Experience.Stored": this.data.actorData.actor.system.Vital.Experience.Stored,
				//	};
				this.render();
			},
		},
	};
	//? Define the dialog options
	const formOptions = {
		//? Placeholder for future use
	};
	const formData = {
		actor: progressionActorData,
		buttons: formButtons,
		content: formContent,
		title: `${progressionActorData.actor.name}'s 📈 Progression`,
	};
	metaLog(
		3,
		"openProgressionForm",
		"Data we pass along to the new Form",
		"formData:",
		formData,
		"formOptions:",
		formOptions
	);
	new MetanthropesProgressionForm(formData, formOptions).render(true);
}

export class MetanthropesProgressionForm extends FormApplication {
	constructor(object = {}, options = {}) {
		//* the below is the default from Foundry for FormApplication
		super(options);
		/**
		 * The object target which we are using this form to modify
		 * @type {*}
		 */
		this.object = object;
		//!? should I use this section to put the form?
		/**
		 * A convenience reference to the form HTMLElement
		 * @type {HTMLElement}
		 */
		this.form = null;
		/**
		 * Keep track of any FilePicker instances which are associated with this form
		 * The values of this Array are inner-objects with references to the FilePicker instances and other metadata
		 * @type {FilePicker[]}
		 */
		//? Unused atm
		this.filepickers = [];
		/**
		 * Keep track of any mce editors which may be active as part of this form
		 * The values of this object are inner-objects with references to the MCE editor and other metadata
		 * @type {Object<string, object>}
		 */
		//todo placeholder for the Perks tab editors
		this.editors = {};
	}
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.id = "progression-form";
		options.template = "systems/metanthropes-system/templates/progression/progression-form.hbs";
		options.width = 1012;
		options.height = 700;
		options.classes = ["metanthropes", "progression"];
		options.tabs = [
			{
				navSelector: ".progressionnavselector",
				contentSelector: ".progressionnavtabs",
				initial: "progression-overview",
			},
		];
		options.closeOnSubmit = true;
		options.submitOnChange = false;
		options.submitOnClose = false;
		options.resizable = true;
		options.minimizable = true;
		options.title = "📈 Metanthropes Progression Form";
		metaLog(3, "MetanthropesProgressionForm", "static defaultOptions", options);
		return options;
	}
	async _render(...args) {
		await super._render(...args);
	}
	//* Get the Data for actor - the data provided is a copy of the actual actor document, so we are not working on the stored values
	async getData() {
		const data = await super.getData();
		const progressionActor = this.object.actor;
		const options = this.options;
		const buttons = this.object.buttons;
		options.title = `${progressionActor.name}'s 📈 Progression`;
		//options.actor = progressionActor;
		metaLog(4, "MetanthropesProgressionForm", "what we get back from getData", data);
		return data;
	}
	//	getData(options = {}) {
	//		//? Retrieve base data structure.
	//		const context = super.getData(options);
	//		metaLog(1, "MetaProgression", "getData", "context:", context);
	//		metaLog(2, "MetaProgression", "getData", "this:", this);
	//		//? Explicitly define the structure of the data for the dialog template to use
	//		return {
	//			content: context.content,
	//			buttons: context.buttons,
	//			actor: this.data.progressionActorData,
	//		};
	//	}
	//* Activate listeners
	activateListeners(html) {
		super.activateListeners(html);
		//? Listen for changes in the Overview tab
		html.find('input[name^="actor.system.Characteristics"], select[name^="actor.system.Characteristics"]').change(
			(event) => this._onOverviewProgressionChange(event)
		);
		//? Listen for changes in the Perk tab
		html.find('select[name^="actor.system.Perks"]').change((event) => this._onPerkProgressionChange(event));
	}
	//* Handle changes from Overview tab
	_onOverviewProgressionChange(event) {
		event.preventDefault();
		metaLog(3, "MetanthropesProgressionForm", "_onOverviewProgressionChange(event):", event);
		//? Extract actor data from the form, using our custom function
		const actorData = metaExtractFormData(event.currentTarget.form);
		metaLog(3, "MetanthropesProgressionForm", "_onOverviewProgressionChange", "actorData:", actorData);
		//? Use a method similar to _prepareDerivedCharacteristicsData to recalculate experience
		this._recalculateOverviewExperience(actorData);
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Handle changes from Perks tab
	_onPerkProgressionChange(event) {
		event.preventDefault();
		metaLog(3, "MetanthropesProgressionForm", "_onPerkProgressionChange(event)", event);
		//	//? Extract actor data from the form, using our custom function and merge it with the existing progress
		//	const progressionFormData = metaExtractFormData(event.currentTarget.form);
		//	metaLog(3, "MetanthropesProgressionForm", "_onPerkProgressionChange", "progressionFormData:", progressionFormData);
		//	//? Adjust the keys in progressionFormData to remove the "actor." prefix
		//	const adjustedFormData = {};
		//	for (const [key, value] of Object.entries(progressionFormData)) {
		//		const adjustedKey = key.startsWith("actor.") ? key.slice(6) : key;
		//		adjustedFormData[adjustedKey] = value;
		//	}
		//	metaLog(4, "MetaProgression", "_onPerkProgressionChange", "adjustedFormData:", adjustedFormData);
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
		metaLog(4, "MetantropesProgressionForm", "_recalculateOverviewExperience", "actorData:", actorData);
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
		metaLog(
			5,
			"MetantropesProgressionForm",
			"_recalculatePerksExperience",
			"progressionActorPerkData:",
			progressionActorPerkData
		);
		const systemData = progressionActorPerkData.system;
		metaLog(
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
			metaLog(
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
		metaLog(5, "MetantropesProgressionForm", "_validateAndStoreExperience", "progressionActorData:", progressionActorData);
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
		metaLog(3, "MetantropesProgressionForm", "_resetProgression", "Reseting Progression");
	}
}
