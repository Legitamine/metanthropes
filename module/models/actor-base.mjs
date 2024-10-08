export default class MetanthropesActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.BASE"];

	static defineSchema() {
		const fields = foundry.data.fields;
		const lifeScore = { required: true, nullable: false, integer: true, positive: true };
		const requiredInteger = { required: true, nullable: false, integer: true };
		const requiredNumber = { required: true, nullable: false, integer: false };
		const requiredString = { required: true, nullable: false };
		const statScore = {required: true, nullable: false, integer: true, min: 0, initial: 1};
		const schema = {};
		//* All Beings
		//* Life
		schema.life = new fields.SchemaField({
			value: new fields.NumberField({
				...lifeScore,
				initial: 10,
				min: 0,
			}),
			starting: new fields.NumberField({
				...lifeScore,
				initial: 10,
			}),
			max: new fields.NumberField({
				...lifeScore,
				initial: 10,
			}),
		});
		//* Physical
		schema.physical = new fields.SchemaField({
			description: new fields.HTMLField(),
			height: new fields.NumberField({
				...requiredNumber,
				initial: 1.65,
			}),
			weight: new fields.NumberField({
				...requiredInteger,
				initial: 62,
			}),
			age: new fields.NumberField({
				...requiredInteger,
				initial: 30,
			}),
			pob: new fields.StringField(),
		});
		//* Movement
		schema.movement;
		//* Cover
		schema.cover;
		//* Vision
		schema.detections;
		//* Resistances
		schema.resistances;
		//* Immunities
		schema.immunities;
		//* Shift
		schema.shift;
		//* Species
		schema.species = new fields.SchemaField({
			description: new fields.HTMLField(),
			name: new fields.StringField(),
			origin: new fields.StringField(),
			metaType: new fields.StringField(), // Metapowered or Non-Metapowered
			majorType: new fields.StringField(), // Organism, Artificial, ET, ED
			minorType: new fields.StringField(), // Humanoid, Spirit, Anima, Animal, Incarnation etc <- or is that the name?
			

		});
		//* Notes
		schema.notes;
		
		//* Intellectual Beings
		//* EXP
		schema.exp;
		//* Characteristics
		schema.chars;
		//* Stats
		schema.stats;
		//* Perks
		schema.perks;
		
		//* Sentient Beings
		//* Destiny
		schema.destiny;
		//* Arc
		schema.arc;
		//* Regression
		schema.regression;
		//* Political Beings
		schema.politics;
		//
		
		return schema;
	}

	//* Data Preparation
	//? Base Data preparation, before embedded documents or derived data.
	prepareBaseData() {
		this._prepareBaseLifeData();
		this._prepareBaseCharacteristicsData(); //todo: duplicate data
		this._prepareBaseMovementData();
	}

	prepareDerivedData() {
		this._prepareDerivedLifeData();
		this._prepareDerivedCharacteristicsData();
		this._prepareDerivedMovementData();
	}

	//? Base Life Data preparation
	_prepareBaseLifeData() {
		game.system.api.metaLog(3, "datamodel prepareBaseLifeData", this);
		life.max = this.life.value;
	}

	//? Base Characteristics Data preparation
	_prepareBaseCharacteristicsData() {
		
	}

	//? Base Movement Data preparation
	_prepareBaseMovementData() {
		
	}

}
