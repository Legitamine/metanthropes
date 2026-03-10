export default class MetanthropesActorV2 extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR"];

	static defineSchema() {
		const f = foundry.data.fields; //? Fields
		const s = {}; //? Schema
		s.resources = new f.SchemaField({
			life: new f.SchemaField({}),
			//todo how do I add the ones that come after Species/Archetypes are defined/added?
		});
		s.actions = new f.SchemaField({
			main: new f.SchemaField({}),
			extra: new f.SchemaField({}),
			reaction: new f.SchemaField({}),
			//todo how do I do the derived ones like movement and focused?
		});
		s.exp = new f.SchemaField({});
		s.physical = new f.SchemaField({
			description: new f.SchemaField({}),
			speed: new f.SchemaField({}),
			weight: new f.SchemaField({}),
			size: new f.SchemaField({}),
			shift: new f.SchemaField({}),
			resistances: new f.SchemaField({}),
			immunities: new f.SchemaField({}),
			hitbox: new f.SchemaField({}), //? From Species
			origin: new f.SchemaField({}), //? From Species
		});
		s.chars = new f.SchemaField({});
		s.stats = new f.SchemaField({});
		s.buffs = new f.SchemaField({});
		s.conditions = new f.SchemaField({});
		s.perks = new f.SchemaField({});
		s.notes = new f.SchemaField({});
		s.meta = new f.SchemaField({}); //not at base actor
		s.strikes = new f.SchemaField({}); //should be ommited much like possessions?
		s.special = new f.SchemaField({}); //same as strikes?
		return s; //? Schema
	}

	prepareBaseData() {}

	prepareDerivedData() {}
}
