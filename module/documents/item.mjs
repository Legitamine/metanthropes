////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Item document for the Metanthropes RPG System for FoundryVTT.
//? This controls how Items are created and what they can do.
//todo: Enable basic functionality
//*
////
import { MetaRoll } from "../helpers/metaroll.mjs";
export class MetanthropesItem extends Item {
	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		// As with the actor class, items are documents that can have their data
		// preparation methods overridden (such as prepareBaseData()).
		super.prepareData();
	}

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData() {
		// If present, return the actor's roll data.
		if (!this.actor) return null;
		const rollData = this.actor.getRollData();
		// Grab the item's system data as well.
		rollData.item = foundry.utils.deepClone(this.system);

		return rollData;
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll() {
		const item = this;

		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get("core", "rollMode");
		const label = `[${item.type}] ${item.name} yay`;

		// If there's no roll data, send a chat message.
		if (!this.system.Activation.statrolled) {
			ChatMessage.create({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
				content: item.system.effects-metapower.value ?? "error no statrolled found",
			});
		}
		// Otherwise, create a roll and send a chat message from it.
		else {
			// Retrieve roll data.
			//? I need to better understand what this does exactly and how it works with the bigger picture.
			const rollData = this.getRollData();
			// capture the info for the MetaRoll function
			const actor = this.actor;
			const stat = this.system.Activation.statrolled.value;
			MetaRoll (actor, stat);
			//! leaving this here because I need to understand what it did and what is no longer necessary.
			//	// Invoke the roll and submit it to chat.
			//	const roll = new Roll(rollData.item.formula, rollData);
			//	// If you need to store the value first, uncomment the next line.
			//	// let result = await roll.roll({async: true});
			//	roll.toMessage({
			//		speaker: speaker,
			//		rollMode: rollMode,
			//		flavor: label,
			//	});
			//	return roll;
		}
	}
}
