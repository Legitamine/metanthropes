import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 2 };
//todo we don't want the same build applied twice on an actor
	//essentially a character should only have one build, their own, even if they import another build to their actor at some point, it's still their own build - or do we want to have my build and then sub-builds that I used at some point?
		//is there really a difference here? perhaps single build is easier to do so go with that?
		// todo review with john - builds === backgrounds with extra steps		

/**
 * MetaBuild stores how an Actor has spend their stored exp
 * 
 * * Contains templates, background ?, perks, metapowers, and even possessions
 * * It should allow for easy share {json?} (export/import) to another World and/or to/from a Compendium
 * * Importing (or adding) a build should require that your Actor has enough 'stored EXP' if you are a Player, or give the Actor the necessairy EXP as Narrator
 * * Some of these builds can be made available as 'background' options for new Actors so they show up in the 'new actor' and/or 'progression' apps
 * todo if it contains background then it can only be used at new actor creation
 * * Auto-calculates the 'base EXP' cost - actual cost will depend on Prime Metapower & Existing Stat Scores & current progression
 * * Note on 'downtime' requirement for Perks (auto-calculate base time) - actual application depends on Metapowers & Perks & available time (needs to tie in to the downtime progression mode once that is implemented)
 * * Can have Species/Templates as requirements ? or give Templates as part of the Build ? or both ?
 *
 * @export
 * @class MetaBuild
 * @typedef {MetaBuild}
 * @extends {MetanthropesItemBase}
 */
export default class MetaBuild extends MetanthropesItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "METANTHROPES.ITEM.BUILD"];
	static defineSchema() {
		return {
			resources: new SchemaField({
				life: new SchemaField({
					initial: new NumberField({ ...standardNumber }),
				}),
			}),
		};
	}
	prepareBaseData() {
		super.prepareBaseData();
	}
	prepareDerivedData() {
		super.prepareDerivedData();
	}
}
