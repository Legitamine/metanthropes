import MetanthropesItemBase from "./item.mjs";
const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 };
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 2 };

export default class MetanthropesTemplate extends MetanthropesItemBase {
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
}
