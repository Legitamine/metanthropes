import MetanthropesItemBase from "./item-base.mjs";

export default class MetanthropesItemSpecies extends MetanthropesItemBase {
	//todo figure out static LOCALIZATION_PREFIXES = []; with inheritance?

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredString = { required: true, nullable: false };
		const nonRequiredString = { required: false, nullable: true, initial: null };
		const schema = super.defineSchema();

		schema.origin = new fields.StringField({
			...requiredString,
			initial: "Origin",
		});
		schema.hitbox = new fields.StringField({
			//todo make it a category with choices instead
			...requiredString,
			initial: "Hitbox", // needs to be an object type instead? ! we can't have an item within an item (right?)
		});
		schema.gender = new fields.StringField({ ...nonRequiredString }); // combine with pronoun below?
		schema.genderPronoun = new fields.StringField({ ...nonRequiredString });
		schema.metaType = new fields.StringField(); // Metapowered or Non-Metapowered - this is not here
		schema.majorType = new fields.StringField(); // Organism, Artificial, ET, ED
		schema.minorType = new fields.StringField(); // Humanoid, Spirit, Anima, Animal, Incarnation etc <- or is that the name?

		return schema;
	}
}
