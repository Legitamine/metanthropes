////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how 
//todo: Enable basic functionality
//* 
////



export class MetanthropesActorSheet extends ActorSheet {
	get template() {
		// doesn't work console.log('${this.actor.data.type}');
		return `systems/metanthropes-system/templates/sheets/${this.actor.type}-sheet.hbs`;
	}

	async getData() {
		// from wfrp4e
		// using the async functions instead of without async - they use an enrichment process check it out
		// from boilerplate:
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = await super.getData();
		// from boilerplate:
		// Use a safe clone of the actor data for further operations.
		const actorData = this.actor.toObject(false)
		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;
		// Prepare character data and items.
//		if (actorData.type == "humanoid") {
//			this._prepareItems(context);
//			this._prepareHumanoidData(context);
//		}
		// Add roll data for TinyMCE editors.
		//context.rollData = context.actor.getRollData();
		// Prepare active effects
		//context.effects = prepareActiveEffectCategories(this.actor.effects);
		//return
		return context;
}
	//prepare humanoid data
//	_prepareHumanoidData(context) {
//
//	}
}