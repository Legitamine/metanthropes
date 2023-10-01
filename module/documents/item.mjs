/**
 * Extend the basic Item with some very simple modifications.
 * 
 * @extends {Item}
 * 
 */
export class MetanthropesItem extends Item {
	prepareData() {
		super.prepareData();
		//? Give Metapowers an image based on the Metapower Name
		if (this.type === "Metapower") {
			const mpname = this.system.MetapowerName.value;
			const imgPath = `systems/metanthropes-system/artwork/metapowers/${mpname}.png`;
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
		console.log("Metanthropes | Item getRollData | Engaged");
		if (!this.actor) return null;
		const rollData = this.actor.getRollData();
		//? Grab the item's system data as well.
		rollData.item = foundry.utils.deepClone(this.system);
		console.log("Metanthropes | Item getRollData | rollData:", rollData);
		return rollData;
	}
}
