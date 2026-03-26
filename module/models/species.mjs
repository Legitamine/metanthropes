import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
//todo we don't want more than applied to the actor
//! perhaps a hybrid is a way to have more than a single species
//! but with some caveats: so choices/initialDice come from the first one you enter
//! but other properties can come from additional species you get, like immunities or addtional life?
/**
 * Species is the basic class for an actor, and defines among many things:
 ** Initial choice for CHARS & dice for STATS during rolling a new Actor
 ** The Hitbox for the Actor
 ** The place of origin for the Actor
 ** Assigns Target types for the Actor
 ** Controls if the Actor can have Destiny and other optional features
 *
 * @export
 * @class MetanthropesSpecies
 * @typedef {MetanthropesSpecies}
 * @extends {MetanthropesItemBase}
 */
export default class MetanthropesSpecies extends MetanthropesItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "METANTHROPES.ITEM.SPECIES"];

	static defineSchema() {
		return {
			resources: new SchemaField({
				life: new SchemaField({
					initial: new NumberField({ ...standardNumber }),
					progressionStep: new NumberField({ ...standardNumber }), //cannot be zero?
					progressionGain: new NumberField({ ...standardNumber }),
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
}
