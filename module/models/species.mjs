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
 * * The place of origin for the Actor | like species[0] //todo summary page
 * * Base size/weight/speed | upgrade if >=10, downgrade if <10
 * * Can forbid certain Templates | Adds to forbidden list //todo should have allowed/restricted list instead of bool options?
 * * Assigns Target types for the Actor | Adds
 * * Controls if it can have Destiny (defines starting amount) | Adds if you didn't have Destiny / or Add to your current Destiny
 * * Auto-calculates min EXP required, gives ammount as total EXP required to Actor once applied
 * 			Template should work the same, Build can spend these exp once applied
 *
 * @export
 * @class MetaSpecies
 * @typedef {MetaSpecies}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default class MetaSpecies extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "METANTHROPES.ITEM.SPECIES"];

	static defineSchema() {
		return {
			summary: defineSummary(),
			options: defineOptions(),
			resources: defineResources(),
			actions: defineActions(),
			chars: defineChars(),
			physical: definePhysical(),
			defenses: defineDefenses(),
			//todo abilities: review structure of what an ability is
			//todo define how species get abilities & what type of abilities are allowed
			//something between a Strike & Possession
			//If !possession !metapower => Ability
			//so Strikes = Abilities
			// Metapowered Strikes = Abilities
			//Athletic stuff = Abilitites
			//Evade /+ parry(+power) ability
			//Medicine = Abilities
			//Crafting = Ability (recipies)
			//Species = tailswipe, breath, etc => Special abilities
		};
	}

	prepareBaseData() {
		super.prepareBaseData();
		//* Movement
		this.physical.maxMovement = Math.ceil(
			metanthropes.system.TABLES.SPEED[this.physical.speed].movement *
				metanthropes.system.TABLES.SIZE[this.physical.size].movement *
				metanthropes.system.TABLES.WEIGHT[this.physical.weight].movement,
		);
	}
	prepareDerivedData() {
		super.prepareDerivedData();
	}
}

//* Schema Components
const { HTMLField, SchemaField, NumberField, StringField, SetField, DocumentUUIDField, BooleanField } =
	foundry.data.fields;
const required = { required: true, nullable: false, blank: false };
const number = { ...required, integer: true };
const choice = { ...number, min: 5, step: 5 };
const score = { ...number, min: 0, initial: 0, max: 5 };
const action = { ...number, min: 0, initial: 1, max: 2 };
const initialLife = { ...number, min: 50, initial: 50, step: 25, max: 500 };
const progressionStep = { ...number, min: 1000, initial: 5000, step: 1000, max: 10000 }; //todo thelw initial edw?
const progressionGain = { ...number, min: 5, initial: 50, step: 5, max: 50 }; //todo thelw initial edw?
const destiny = { ...number, min: 1, initial: 2, max: 10 };
const primary = { ...choice, max: 75, initial: 25 };
const secondary = { ...choice, max: 50, initial: 15 };
const tertiary = { ...choice, max: 25, initial: 5 };
const physicalScore = { ...score, initial: 10, max: 20 };
const resistance = { ...number, min: 0, step: 5, initial: 0, max: 100 };

//* * Summary (Origin)
function defineSummary() {
	return new SchemaField({
		description: new HTMLField(),
		origin: new StringField({ initial: "Place of Origin" }),
		dimension: new StringField({
			...required,
			initial: "material",
			choices: metanthropes.system.TABLES.DIMENSIONS,
		}),
	});
}

//* * Actor Options
function defineOptions() {
	return new SchemaField({
		allowLifeProgression: new BooleanField({ required: true }),
		allowDestiny: new BooleanField({ required: true }),
		allowPerks: new BooleanField({ required: true }),
		allowPossessions: new BooleanField({ required: true }),
		allowMetapowers: new BooleanField({ required: true }),
		targetTypes: new SetField( //todo I want it to include it's own name (?) to the targets?
			new StringField({
				...required,
				choices: metanthropes.system.TABLES.TARGETS,
			}),
			{ required: true, nullable: false, initial: [] },
		),
		forbidTemplates: new DocumentUUIDField({ required: false, placeholder: "Template Document UUID" }),
	});
}

//* * Resources
function defineResources() {
	return new SchemaField({
		life: new SchemaField({
			initial: new NumberField({ ...initialLife }),
			progressionStep: new NumberField({ ...progressionStep }),
			progressionGain: new NumberField({ ...progressionGain }),
		}),
		destiny: new SchemaField({
			initialBase: new NumberField({ ...destiny }),
			initialDice: new NumberField({ ...destiny }),
		}),
	});
}

//* * Actions
function defineActions() {
	//todo zombies den exoune focused, ara allowFocused theloume kapoy (isws template?)
	//todo if(kapoio action = 0 || current < max && !maxMovement) den mporeis na kaneis Focused
	return new SchemaField({
		//todo warning oti kanei OP, extra exp cost
		main: new NumberField({ ...action }),
		extra: new NumberField({ ...action }),
		reaction: new NumberField({ ...action }),
	});
}

//* * Characteristics
function defineChars() {
	return new SchemaField({
		primary: new NumberField({ ...primary }),
		secondary: new NumberField({ ...secondary }),
		tertiary: new NumberField({ ...tertiary }),
	});
}

//* * Physical
function definePhysical() {
	return new SchemaField({
		description: new HTMLField(),
		hitbox: new DocumentUUIDField({
			//? Humanoid Hit Location table by default
			...required,
			placeholder: "Rollable Table Document UUID",
			initial: "Compendium.metanthropes.hit-location.RollTable.cmCma7xrAcjgVrjL",
		}),
		speed: new NumberField({ ...physicalScore }),
		weight: new NumberField({ ...physicalScore }),
		size: new NumberField({ ...physicalScore }),
		allowedMovementTypes: new SetField(
			new StringField({
				...required,
				choices: metanthropes.system.TABLES.MOVEMENTS,
			}),
			{ ...required, initial: ["climb", "crawl", "swim", "walk"] },
		),
	});
}

//* * Defenses
function defineDefenses() {
	return new SchemaField({
		resistances: defineResistances(),
		immunities: defineImmunities(),
		cover: defineCover(),
	});
}

//* * * Resistances
function defineResistances() {
	return new SchemaField(
		Object.fromEntries(
			Object.keys(metanthropes.system.TABLES.ENERGY).map((energyKey) => [
				energyKey,
				new NumberField({ ...resistance }),
			]),
		),
	);
}

//* * * Immunities
function defineImmunities() {
	const IMMUNITIES = metanthropes.system.TABLES.IMMUNITIES;
	return new SchemaField(
		Object.fromEntries(
			Object.entries(IMMUNITIES).map(([immunityKey, immunity]) => {
				return [immunityKey, immunity.score ? new NumberField({ ...score }) : new BooleanField()];
			}),
		),
	);
}

//* * * Cover
function defineCover() {
	const cover = {
		...number,
		initial: 0,
		choices: metanthropes.system.TABLES.COVER,
	};
	return new SchemaField(
		Object.fromEntries(
			Object.keys(metanthropes.system.TABLES.ENERGY).map((energyKey) => [
				energyKey,
				new NumberField({ ...cover }),
			]),
		),
	);
}
