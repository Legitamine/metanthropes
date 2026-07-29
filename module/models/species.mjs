import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const choiceNumber = { required: true, nullable: false, integer: true, min: 1, initial: 1, max: 100 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
/**
 * Species
 *
 * What is defined | How multiple Species interact
 * upgrade denotes that we keep the best value
 * downgrade denotes that we keep the worst value
 * add denotes that we add the value to the existing
 * * Initial Life | upgrade from all species.life.initial - done
 * * Defines the initial #Actions | Upgrade
 * * The Hitbox for the Actor | species[0] should hold the hitbox link to rollable table
 * * Initial choice for CHARS (Pri/Sec/Ter) | upgrades min=1
 * * The place of origin for the Actor | like species[0]
 * * Auto-calculates min EXP required, gives ammount as total EXP required to Actor once applied
 * 			Template should work the same, Build can spend these exp once applied
 * * Base size/weight/speed | upgrade if >=10, downgrade if <10
 * * Can forbid certain Templates | Adds to forbidden list
 * * Assigns Target types for the Actor | Adds
 * * Controls if it can have Destiny (defines starting amount) | Adds if you didn't have Destiny / or Add to your current Destiny
 *
 * @export
 * @class MetaSpecies
 * @typedef {MetaSpecies}
 * @extends {MetanthropesItemBase}
 */
export default class MetaSpecies extends MetanthropesItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "METANTHROPES.ITEM.SPECIES"];

	static defineSchema() {
		return {
			resources: new SchemaField({
				life: new SchemaField({
					initial: new NumberField({ ...standardNumber }),
					//todo progression boolean
					progressionStep: new NumberField({ ...standardNumber }),
					progressionGain: new NumberField({ ...standardNumber }),
				}),
			}),
			actions: new SchemaField({
				main: new NumberField({ ...standardNumber }),
				extra: new NumberField({ ...standardNumber }),
				reaction: new NumberField({ ...standardNumber }),
			}),
			//todo den thelw ayto akrivws, thelw 3 values gia ta choices
			//! kanoune choose ola ta species the same way? => yes
			//todo ara ayto edw paei kapoy sto base calculation, afou exw ta totals apo ta species, templates
			chars: new SchemaField({
				primary: new NumberField({ ...choiceNumber }),
				secondary: new NumberField({ ...choiceNumber }),
				tertiary: new NumberField({ ...choiceNumber }),
			}),
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
