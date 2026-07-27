//* build is how an actor can spend their stored exp
//? What other requirements besides species/template?
// background - is a limited subset of a build that is available in the UI for new human characters?
// +bool canBeBackground that shows them as 'Backgrounds' in the new actor screens
// perks
// metapowers
// possessions
// cost = autocalculate on application to the actor (because of relative MP according to their prime)
//    and downtime requirement for perks
import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 2 };

/**
 * Description placeholder
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
