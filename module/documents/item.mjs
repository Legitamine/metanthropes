import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 *
 * @extends {Item}
 *
 */
export class MetanthropesItem extends Item {
	/** @override */
	async _preCreate(data, options, user) {
		//? Built-in Foundry check for Active Effect Legacy Transferral
		if (this.parent instanceof Actor && !CONFIG.ActiveEffect.legacyTransferral) {
			for (const effect of this.effects) {
				if (effect.transfer) effect.updateSource(ActiveEffect.implementation.getInitialDuration());
			}
		}
		//? Confirm the Actor can have this type of Item
		if (
			this.parent instanceof Actor &&
			(this.type === "Metapower" || this.type === "Combo") &&
			!this.parent.hasEnterMeta
		) {
			metaLog(
				4,
				"MetaItem _preCreate",
				"No Metapowers allowed:",
				this.name,
				"was added to actor:",
				this.actor.type,
				this.actor.name,
				"aborting adding the Metapower to the Actor"
			);
			return false;
		}
		if (this.parent instanceof Actor && this.type === "Possession" && !this.parent.hasPossessions) {
			metaLog(
				4,
				"MetaItem _preCreate",
				"No Possessions allowed:",
				this.name,
				"was added to actor:",
				this.actor.type,
				this.actor.name,
				"aborting adding the Possession to the Actor"
			);
			return false;
		}
		//? Handle Non-Strike Possessions
		if (
			this.parent instanceof Actor &&
			this.type === "Possession" &&
			this.system.Category.value !== "Strike" &&
			this.parent.canOnlyHaveStrikes
		) {
			//? Only allow Non-Strike Possessions to actors that can have them
			metaLog(
				4,
				"MetaItem _preCreate",
				"Non-Strike Possession",
				this.name,
				"was added to actor:",
				this.actor.type,
				this.actor.name,
				"aborting adding the Possession to the Actor"
			);
			return false;
		}
		return super._preCreate(data, options, user);
	}
	/** @override */
	prepareData() {
		super.prepareData();
		//? Give Metapowers an image based on the Metapower Name
		if (this.type === "Metapower") {
			const mpname = this.system.MetapowerName.value;
			const imgPath = `systems/metanthropes-system/artwork/metapowers/${mpname}.webp`;
			this.img = imgPath;
		}
	}
	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	//! If I understand this correct - returing the actorData will also inlcude this rollData that includes a copy of the system - why do I need that?
	//! Make sure I review the item-sheet as well to optimize this where needed!!
	getRollData() {
		//! Is this being used?
		//? If present, return the actor's roll data.
		metaLog(5, "MetaItem getRollData", "Engaged - !!! THIS SHOULD NOT HAPPEN !!!");
		if (!this.actor) return null;
		const rollData = this.actor.getRollData();
		//? Grab the item's system data as well.
		rollData.item = foundry.utils.deepClone(this.system);
		metaLog(5, "MetaItem getRollData", "rollData:", rollData);
		return rollData;
	}
}
