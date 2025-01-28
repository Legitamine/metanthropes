import MetanthropesItemSpecies from "./item-species.mjs";

export default class MetanthropesActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.BASE"];

	static defineSchema() {
		const fields = foundry.data.fields;
		const effectLevel = { required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 };
		const lifeScore = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
		const actionsAvailable = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
		const requiredInteger = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
		const requiredNumber = { required: true, nullable: false, integer: false, min: 0, initial: 0 };
		const requiredString = { required: true, nullable: false };
		const statScore = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
		const schema = {};
		//* Resources
		schema.resources = new fields.SchemaField({
			life: new fields.SchemaField({
				value: new fields.NumberField({ ...lifeScore }),
				max: new fields.NumberField({ ...lifeScore }),
			}),
			actions: new fields.SchemaField({
				main: new fields.NumberField({ ...actionsAvailable }),
				extra: new fields.NumberField({ ...actionsAvailable }),
				reaction: new fields.NumberField({ ...actionsAvailable }),
				movement: new fields.NumberField({ ...actionsAvailable }),
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
		schema.movement = new fields.SchemaField({
			value: new fields.NumberField({ ...effectLevel }),
			buff: new fields.NumberField({ ...effectLevel }),
			condition: new fields.NumberField({ ...effectLevel }),
			speed: new fields.SchemaField({
				value: new fields.NumberField({ ...effectLevel }),
				buff: new fields.NumberField({ ...effectLevel }),
				condition: new fields.NumberField({ ...effectLevel }),
			}),
			weight: new fields.SchemaField({
				value: new fields.NumberField({ ...effectLevel }),
				buff: new fields.NumberField({ ...effectLevel }),
				condition: new fields.NumberField({ ...effectLevel }),
			}),
			size: new fields.SchemaField({
				value: new fields.NumberField({ ...effectLevel }),
				buff: new fields.NumberField({ ...effectLevel }),
				condition: new fields.NumberField({ ...effectLevel }),
			}),
		});
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
		this.resources.life.max = this.resources.life.value;
	}

	//? Base Characteristics Data preparation
	_prepareBaseCharacteristicsData() {}

	//? Base Movement Data preparation
	_prepareBaseMovementData() {
		this.movement.value = this.movement.size.value + this.movement.speed.value + this.movement.weight.value;
	}

	//? Derived Life Data preparation
	_prepareDerivedLifeData() {}

	//? Derived Characteristics Data preparation
	_prepareDerivedCharacteristicsData() {}

	//? Derived Movement Data preparation
	_prepareDerivedMovementData() {}
}
