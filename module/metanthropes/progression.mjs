//* Progression Dialog Class
//? Import metaExtractFormData Helper
import { metaExtractFormData } from "../helpers/metahelpers.mjs";
/**
 * Extend the basic Dialog class to create a custom progression dialog window
 * @extends {Dialog}
 *
 * @param {Object} data
 * @param {Object} options
 */
export class ProgressionDialog extends Dialog {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "systems/metanthropes-system/templates/progression/progression-dialog.hbs",
			classes: ["metanthropes", "progression"],
			width: 1012,
			height: 700,
			tabs: [
				{
					navSelector: ".progressionnavselector",
					contentSelector: ".progressionnavtabs",
					initial: "progression-overview",
				},
			],
			closeOnSubmit: true,
			submitOnChange: false,
			submitOnClose: false,
			resizable: true,
		});
	}
	//* Get the Data for actor - the data provided is a copy of the actual actor document, so we are not working on the stored values
	getData(options = {}) {
		//? Retrieve base data structure.
		const context = super.getData(options);
		//? Initialize tempExperienceValues if it's not already set
		this.tempExperienceValues = {
			"TempSpent": this.data.actorData.actor.system.Vital.Experience.Spent,
			"TempStored": this.data.actorData.actor.system.Vital.Experience.Stored,
		};
		//? Explicitly define the structure of the data for the dialog template to use
		console.warn("Metanthropes | Progression Dialog | getData | this:", this);
		console.log("Metanthropes | Progression Dialog | getData | context:", context)
		return {
			content: context.content,
			buttons: context.buttons,
			actor: this.data.actorData.actor,
			tempExperience: this.tempExperienceValues,
		};
	}
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
	_recalculateOverviewExperience(actorData) {
		console.warn("Metanthropes | Progression Dialog | _recalculateOverviewExperience | actorData:", actorData);
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
	_recalculatePerksExperience(actorData) {
		if (
			actorData.type == "Vehicle" ||
			actorData.type == "Animal" ||
			actorData.type == "Animated-Plant" ||
			actorData.type == "MetaTherion"
		)
			return;
		const systemData = actorData.system;
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
			console.warn(
				"Metanthropes | Actor Prep |",
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
			(systemData.Vital.Experience.Spent =
				Number(experienceSpent) + Number(experienceAlreadySpent) - Number(startingPerks * 100))
		);
		parseInt(
			(systemData.Vital.Experience.Stored = Number(
				Number(systemData.Vital.Experience.Total) -
					Number(experienceSpent) -
					Number(experienceAlreadySpent) -
					Number(systemData.Vital.Experience.Manual) +
					//? here we are adding the cost of free starting perks to the stored xp
					Number(startingPerks) * 100
			))
		);
		//? Store the calculated values in a temporary object
		//! wtf chatGPT!?
		actorData.system.Vital.Experience.Spent = systemData.Vital.Experience.Spent;
		actorData.system.Vital.Experience.Stored = systemData.Vital.Experience.Stored;
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Handle changes from Overview tab
	_onOverviewProgressionChange(event) {
		event.preventDefault();
		console.log("Metanthropes | Progression Dialog | _onOverviewProgressionChange | event:", event)
		//? Extract actor data from the form, using our custom function
		const actorData = metaExtractFormData(event.currentTarget.form);
		console.warn("Metanthropes | Progression Dialog | _onOverviewProgressionChange | actorData:", actorData);
		//? Use a method similar to _prepareDerivedCharacteristicsData to recalculate experience
		this._recalculateOverviewExperience(actorData);
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Handle changes from Perks tab
	_onPerkProgressionChange(event) {
		event.preventDefault();
		//? Extract actor data from the form, using our custom function
		const actorData = metaExtractFormData(event.currentTarget.form);
		console.warn("Metanthropes | Progression Dialog | _onPerkProgressionChange | actorData:", actorData);
		//? Use a method similar to _prepareDerivedPerkXPData to recalculate experience
		this._recalculatePerksExperience(actorData);
		//? Update the displayed values in the dialog
		this.render();
	}
	//* Recalculate the total Experience spent and stored
	_validateAndStoreExperience(actorData) {
		const systemData = actorData.system;
		//? Validate that stored experience is not negative
		if (systemData.Vital.Experience.Stored < 0) {
			//? Disable the Confirm button
			this.dialog.find('button[data-button="confirm"]').prop("disabled", true);
			//? Display a warning (you can customize this to fit your UI/UX)
			ui.notifications.warn("Stored Experience is Negative!");
		} else {
			//? Enable the Confirm button if it was previously disabled
			this.dialog.find('button[data-button="confirm"]').prop("disabled", false);
		}
		//? Use the temporary object to update the actor data
		if (this.tempExperienceValues) {
			this.actor.update(this.tempExperienceValues);
		}
	}
}
//* Main function for creating and managing the dialog
/**
 * Open the Progression Dialog for the provided actor.
 *
 * @param {Object} actorData
 * @param {Object} dialogOptions
 */
export async function openProgressionDialog(actorData) {
	//? Define the dialog content
	const dialogContent = "Make sure that your Stored Experience is not negative before confirming!";
	//? Define the dialog buttons
	const dialogButtons = {
		confirm: {
			label: "Confirm 📈 Progression",
			callback: async (html) => {
				//? Extract actor data from the form
				const formData = new FormData(html[0]);
				const actorData = this._getFormData(formData);
				//? Validate the experience values
				this._validateAndStoreExperience(actorData);
				//? If stored experience is not negative, update the actor
				if (this.tempExperienceValues["system.Vital.Experience.Stored"] >= 0) {
					await actorData.actor.update(this.tempExperienceValues);
				} else {
					//? Optionally, you can provide a notification or feedback to the user if the validation fails
					ui.notifications.warn("Please ensure Stored Experience is not negative before confirming.");
				}
			},
		},
		reset: {
			label: "Reset 📈 Progression",
			callback: () => {
				this.tempExperienceValues = {
					"system.Vital.Experience.Spent": this.data.actorData.actor.system.Vital.Experience.Spent,
					"system.Vital.Experience.Stored": this.data.actorData.actor.system.Vital.Experience.Stored,
				};
				this.render();
			},
		},
	};
	//? Define the dialog options
	const dialogOptions = {
		//? Placeholder for future use
	};
	const dialogData = {
		actorData: actorData,
		buttons: dialogButtons,
		content: dialogContent,
		title: `${actorData.actor.name}'s 📈 Progression`,
	};
	const progressionDialog = new ProgressionDialog(dialogData, dialogOptions);
	progressionDialog.render(true);
}
