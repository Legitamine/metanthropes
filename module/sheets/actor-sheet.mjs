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
		console.log('${this.actor.data.type}');
		return `systems/metanthropes-system/templates/sheets/${this.actor.data.type}-sheet.hbs`;
	}
}