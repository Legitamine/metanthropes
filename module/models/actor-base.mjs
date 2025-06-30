//import MetanthropesItemSpecies from "./item-species.mjs";

export default class MetanthropesActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.BASE"];

		static defineSchema() {
		const fields = foundry.data.fields;

		const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
		const buffLevelNumber = { required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 };
		const conditionLevelNumber = { required: true, nullable: false, integer: true, min: 0, max: 5, initial: 0};
		const effectLevelNumber = { required: true, nullable: false, integer: true, min: -20, max: 20, initial: 10 }; //!should not be called effect?
		//numberfield options
		//!positive bool
		//max
		//initial
		//gmOnly bool
		//!choices
		//readonly
		//step
		const simpleStringValue = { required: true, nullable: false, initial: "default value" };

		const schema = {};
		//* Resources
		schema.resources = new fields.SchemaField({
			life: new fields.SchemaField({
				current: new fields.NumberField({ ...scoreNumber }),
				max: new fields.NumberField({ ...scoreNumber }),
			}),
			actions: new fields.SchemaField({
				main: new fields.NumberField({ ...scoreNumber }),
				movement: new fields.NumberField({ ...scoreNumber }),
				//extra: new fields.NumberField({ ...actionsAvailable }),
				//reaction: new fields.NumberField({ ...actionsAvailable }),
			}),
		});
		//* Physical - species??
		schema.physical = new fields.SchemaField({
			description: new fields.HTMLField(),
			hitbox: new fields.DocumentUUIDField(),
			//options
			//required bool/true
			//!blank bool/false= don't allow null/blank as a save option when false
			//nullable bool/true
			//initial null
			//type undefined - edw isws kanw specify to type of document?
			//embedded undefined
			//!textSearch bool where is it defined? what does it do?
			//!trim bool /true def ^ same
			speed: new fields.SchemaField({
				current: new fields.NumberField({ ...effectLevelNumber }),
				buff: new fields.NumberField({ ...buffLevelNumber }),
				condition: new fields.NumberField({ ...conditionLevelNumber }),
			}),
			weight: new fields.SchemaField({
				current: new fields.NumberField({ ...effectLevelNumber }),
				buff: new fields.NumberField({ ...buffLevelNumber }),
				condition: new fields.NumberField({ ...conditionLevelNumber }),
			}),
			size: new fields.SchemaField({
				current: new fields.NumberField({ ...effectLevelNumber }),
				buff: new fields.NumberField({ ...buffLevelNumber }),
				condition: new fields.NumberField({ ...conditionLevelNumber }),
			}),
			age: new fields.NumberField({ ...scoreNumber }),
			pob: new fields.StringField({ ...simpleStringValue }),
			cover: new fields.StringField({ ...simpleStringValue }),
			detections: new fields.StringField({ ...simpleStringValue }),
			resistances: new fields.StringField({ ...simpleStringValue }),
			immunities: new fields.StringField({ ...simpleStringValue }),
			shift: new fields.StringField({ ...simpleStringValue }),
		});
		//* Characteristics
		schema.chars = new fields.SchemaField(
			Object.entries(metanthropes.system.CHARS).reduce((obj, [charKey, charData]) => {
				obj[charKey] = new fields.SchemaField({
					current: new fields.NumberField({
						...scoreNumber,
						id: charData.id,//!den pairnei ayta poy den einai already defined sto schema tou numberfield?
						label: charData.label,
						hint: charData.hint,
					}),
					// id: new fields.StringField({ initial: charData.id }),
					// label: new fields.StringField({ initial: charData.label }),
					// hint: new fields.StringField({ initial: charData.hint }),
				});
				return obj;
			}, {})
		);
		//* Stats
		//schema.stats = new fields.SchemaField();
		//* Special Rolls
		//* AAE ?
		//* Other / notes / owner? admin stuff
		//schema.other;
		// schema.notes = new fields.SchemaField({
		// 	metaOwner: new fields.StringField(),
		// });

		//* Possible Extentions outside Base
		//* Species defines initial base actor values + extras
		// schema.species = new fields.SchemaField(
		// 	{
		// 		name: new fields.StringField({ blank: false }),
		// 		img: new fields.StringField(),
		// 		...MetanthropesItemSpecies.defineSchema(),
		// 	},
		// 	{
		// 		required: true,
		// 		nullable: true,
		// 		initial: null,
		// 	}
		// );
		//* Intelligent-Sentient-Profession-Archetype
		// schema.exp - progression;
		// schema.perks;
		// schema.arc - regression - background;
		// //* Metapowers
		// schema.metamorphosis;
		// //* Destiny
		// schema.oxidestiny - resource;
		// //* ??? extentions?
		// schema.politics;
		// schema.achievements;

		return schema;
		//base actor: hitbox, life, stats, actions (main, movement), AAe, special rolls, strikes
		// species ->

		//actions: duplicants and animated will level up actions tous
		//duplicants nai men destiny alla oxi really (kovoune tou owner - isws me active effect kapws)

		//const actionsAvailable = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
		//const requiredInteger = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
		//const requiredNumber = { required: true, nullable: false, integer: false, min: 0, initial: 0 };
		//const requiredString = { required: true, nullable: false };
		//const statScore = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
	}

	// static defineSchema() {
	// 	const fields = foundry.data.fields;
	// 	const scoreNumber = { required: true, nullable: false, integer: true, min: 0 };

	// 	const lifeScore = { required: true, nullable: false, integer: true, min: 0, initial: undefined };
	// 	const lifeValue = { required: true, nullable: false, integer: true, min: 0 };

	// 	const effectLevel = { required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 };
	// 	const actionsAvailable = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
	// 	const requiredInteger = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
	// 	const requiredNumber = { required: true, nullable: false, integer: false, min: 0, initial: 0 };
	// 	const requiredString = { required: true, nullable: false };
	// 	const statScore = { required: true, nullable: false, integer: true, min: 0, initial: 1 };
	// 	// const baseNumberFields = {
	// 	// 	current: new fields.NumberField({...kati}),
	// 	// }
	// 	const schema = {};
	// 	//* Resources
	// 	schema.resources = new fields.SchemaField({
	// 		life: new fields.SchemaField({
	// 			current: new fields.NumberField({ ...scoreNumber }),
	// 			max: new fields.NumberField({ ...scoreNumber }),
	// 		}),
	// 		actions: new fields.SchemaField({
	// 			main: new fields.NumberField({ ...actionsAvailable }),
	// 			extra: new fields.NumberField({ ...actionsAvailable }),
	// 			reaction: new fields.NumberField({ ...actionsAvailable }),
	// 			movement: new fields.NumberField({ ...actionsAvailable }),
	// 		}),
	// 	});
	// 	//* Physical
	// 	schema.physical = new fields.SchemaField({
	// 		description: new fields.HTMLField(),
	// 		height: new fields.NumberField({
	// 			...requiredNumber,
	// 			initial: 1.65,
	// 		}),
	// 		weight: new fields.NumberField({
	// 			...requiredInteger,
	// 			initial: 62,
	// 		}),
	// 		age: new fields.NumberField({
	// 			...requiredInteger,
	// 			initial: 30,
	// 		}),
	// 		pob: new fields.StringField(),
	// 	});
	// 	//* Movement
	// 	schema.movement = new fields.SchemaField({
	// 		value: new fields.NumberField({ ...effectLevel }),
	// 		buff: new fields.NumberField({ ...effectLevel }),
	// 		condition: new fields.NumberField({ ...effectLevel }),
	// 		speed: new fields.SchemaField({
	// 			value: new fields.NumberField({ ...effectLevel }),
	// 			buff: new fields.NumberField({ ...effectLevel }),
	// 			condition: new fields.NumberField({ ...effectLevel }),
	// 		}),
	// 		weight: new fields.SchemaField({
	// 			value: new fields.NumberField({ ...effectLevel }),
	// 			buff: new fields.NumberField({ ...effectLevel }),
	// 			condition: new fields.NumberField({ ...effectLevel }),
	// 		}),
	// 		size: new fields.SchemaField({
	// 			value: new fields.NumberField({ ...effectLevel }),
	// 			buff: new fields.NumberField({ ...effectLevel }),
	// 			condition: new fields.NumberField({ ...effectLevel }),
	// 		}),
	// 	});
	// 	//* Cover
	// 	schema.cover;
	// 	//* Vision
	// 	schema.detections;
	// 	//* Resistances
	// 	schema.resistances;
	// 	//* Immunities
	// 	schema.immunities;
	// 	//* Shift
	// 	schema.shift;
	// 	//* Species
	// 	// schema.species = new fields.SchemaField(
	// 	// 	{
	// 	// 		name: new fields.StringField({ blank: false }),
	// 	// 		img: new fields.StringField(),
	// 	// 		...MetanthropesItemSpecies.defineSchema(),
	// 	// 	},
	// 	// 	{
	// 	// 		required: true,
	// 	// 		nullable: true,
	// 	// 		initial: null,
	// 	// 	}
	// 	// );
	// 	//* Notes
	// 	schema.notes = new fields.SchemaField({
	// 		metaOwner: new fields.StringField(),
	// 	});

	// 	//* Intellectual Beings
	// 	//* EXP
	// 	schema.exp;
	// 	//* Characteristics
	// 	schema.chars = new fields.SchemaField(
	// 		Object.entries(metanthropes.system.CHARS).reduce((obj, [charKey, charData]) => {
	// 			obj[charKey] = new fields.SchemaField({
	// 				value: new fields.NumberField({
	// 					...requiredInteger,
	// 					initial: 5,
	// 					min: 0,
	// 				}),
	// 				id: new fields.StringField({ initial: charData.id }),
	// 				//label: charData.label,
	// 				//hint: charData.hint,
	// 			});
	// 			return obj;
	// 		}, {})
	// 	);
	// 	//* Stats
	// 	schema.stats;
	// 	//* Perks
	// 	schema.perks;

	// 	//* Sentient Beings
	// 	//* Destiny
	// 	schema.destiny;
	// 	//* Arc
	// 	schema.arc;
	// 	//* Regression
	// 	schema.regression;
	// 	//* Political Beings
	// 	schema.politics;
	// 	//

	// 	return schema;
	// }

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
		this.resources.life.max = this.chars.body.current + 50;
		// species initial max + progression max + endurance max + size max
	}

	//? Base Characteristics Data preparation
	_prepareBaseCharacteristicsData() {}

	//? Base Movement Data preparation
	_prepareBaseMovementData() {
		this.movement.value = this.movement.size.value + this.movement.speed.value + this.movement.weight.value;
	}

	//? Derived Life Data preparation
	_prepareDerivedLifeData() {
		this.resources.life.current = this.resources.life.max;
	}

	//? Derived Characteristics Data preparation
	_prepareDerivedCharacteristicsData() {}

	//? Derived Movement Data preparation
	_prepareDerivedMovementData() {}
}
