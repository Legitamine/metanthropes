import MetanthropesItemBase from "./item-base.mjs";

export default class MetanthropesItemSpecies extends MetanthropesItemBase {
	static LOCALIZATION_PREFIXES = [
		...super.LOCALIZATION_PREFIXES,
		"METANTHROPES.ITEM.SPECIES",
	];

	static defineSchema() {
		const f = foundry.data.fields; //? Fields
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
