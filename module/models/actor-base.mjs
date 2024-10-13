import MetanthropesItemSpecies from "./item-species.mjs";

export default class MetanthropesActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.BASE"];

	static defineSchema() {
		const fields = foundry.data.fields;
		const lifeScore = { required: true, nullable: false, integer: true, positive: true };
		const requiredInteger = { required: true, nullable: false, integer: true };
		const requiredNumber = { required: true, nullable: false, integer: false };
		const requiredString = { required: true, nullable: false };
		const statScore = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
		const schema = {};
		//* All Beings
		//todo * Life move to resources.life
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
		schema.species = new fields.SchemaField(
			{
				name: new fields.StringField({ blank: false }),
				img: new fields.StringField(),
				...MetanthropesItemSpecies.defineSchema(),
			},
			{
				required: true,
				nullable: true,
				initial: null,
			}
		);
		//* Notes
		schema.notes = new fields.SchemaField({
			metaOwner: new fields.StringField(),
		});

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

		console.log(this);
	}

	//? Base Life Data preparation
	_prepareBaseLifeData() {
		metanthropes.utils.metaLog(3, "datamodel prepareBaseLifeData", this);
		this.life.max = this.life.value;
	}

	//? Base Characteristics Data preparation
	_prepareBaseCharacteristicsData() {}

	//? Base Movement Data preparation
	_prepareBaseMovementData() {}

	//? Derived Life Data preparation
	_prepareDerivedLifeData() {}

	//? Derived Characteristics Data preparation
	_prepareDerivedCharacteristicsData() {}

	//? Derived Movement Data preparation
	_prepareDerivedMovementData() {}
}
