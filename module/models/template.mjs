import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 2 };
//todo we don't want the same template applied twice on an actor

/**
 * Templates are optional and provide an Actor with aditional mechanics
 * * Auto-calculated EXP 'costs' are added to the Actor's total EXP
 * * Augmented/Reduced CHARS that add to the Base values
 * * Can require a specific Species, or required by a Species (Metatherion requires Metapowered)
 * * Can require another Template or be required by another Template (Revenant requires Animatated)
 * * Gives access to special abilities
 * 	thru Active Effects (always active passive abilities)
 *  Additional Resistances, Immunities and Special abilities via AEE or directly?
 * 	Special/Actions
 *  Strikes
 * * Can add special game mechanics or information we'd need later (like owner/origin of animated)
 * * Cannot affect physical properties
 * * Can add/remove Target Types
 * * Can add initial Life
 * * Can add Destiny or require Destiny Cost !Once
 * * Can Adds/Removes Available Actions (or action types like perks or other abilities)
 * * Can add Progression (+ initial Life per EXP total)
 * * Examples
 * swarm template (count = inverse size calculation)
 * animated template (by who) mpainei k se trees k 'revived'
 * revenant also allows use of perks/metapowers
 * protagonist (save vs death - triggered or via AEE?)
 * @export
 * @class MetanthropesTemplate
 * @typedef {MetaTemplate}
 * @extends {MetanthropesItemBase}
 */
export default class MetaTemplate extends MetanthropesItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "METANTHROPES.ITEM.TEMPLATE"];

	static defineSchema() {
		return {
			resources: new SchemaField({
				life: new SchemaField({
					initial: new NumberField({ ...standardNumber }),
				}),
			}),
			//todo den thelw ayto akrivws, thelw 3 values gia ta choices
			//! kanoune choose ola ta species the same way?
			chars: new SchemaField(
				Object.keys(metanthropes.system.CHARS).reduce((obj, charKey) => {
					obj[charKey] = new SchemaField({
						initial: new NumberField({ ...standardNumber }),
					});
					return obj;
				}, {}),
			),
			stats: new SchemaField(
				Object.keys(metanthropes.system.STATS).reduce((obj, statKey) => {
					obj[statKey] = new SchemaField({
						initial: new NumberField({ ...standardNumber }),
					});
					return obj;
				}, {}),
			),
		};
		const s = super.defineSchema(); //? Schema

		const requiredString = { required: true, nullable: false };
		const nonRequiredString = { required: false, nullable: true, initial: null };

		s.origin = new f.StringField({
			...requiredString,
			initial: "Origin",
		});
		s.hitbox = new f.StringField({
			//todo make it a category with choices instead
			...requiredString,
			initial: "Hitbox", // needs to be an object type instead? ! we can't have an item within an item (right?)
		});
		s.gender = new f.StringField({ ...nonRequiredString }); // combine with pronoun below?
		s.genderPronoun = new f.StringField({ ...nonRequiredString });
		//todo need to think around target types, targeting and creating a
		s.metaType = new f.StringField(); // Metapowered or Non-Metapowered - this is not here
		s.majorType = new f.StringField(); // Organism, Artificial, ET, ED
		s.minorType = new f.StringField(); // Humanoid, Spirit, Anima, Animal, Incarnation etc <- or is that the name?

		return s;
	}
	prepareBaseData() {
		super.prepareBaseData();
	}
	prepareDerivedData() {
		super.prepareDerivedData();
	}
}
