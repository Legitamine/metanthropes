/**
 * MetaActor Class
 * One Actor to Rule them All and in the System bind them
 *
 * @export
 * @class MetaActor
 * @typedef {MetaActor}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default class MetaActor extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR"];
	static defineSchema() {
		const { CHARS, STATS, BUFFS, CONDITIONS, CORECONDITIONS, TABLES } = metanthropes.system;
		return {
			resources: defineResources(),
			actions: defineActions(),
			exp: defineEXP(),
			physical: definePhysical(TABLES),
			chars: defineChars(CHARS),
			stats: defineStats(STATS),
			buffs: defineBuffs(BUFFS),
			conditions: defineConditions(CONDITIONS),
			coreConditions: defineCoreConditions(CORECONDITIONS),
			perks: definePerks(),
			notes: defineNotes(),
		};
	}

	//* Base = Initial (from Species/Archetypes) + Progressed = einai ta stuff poy theloume gia progression!
	prepareBaseData() {
		super.prepareBaseData();
		const { CHARS, STATS } = metanthropes.system;
		const { life } = this.resources;
		const { main, extra, reaction } = this.actions;
		//const { speed, weight, size } = this.physical;
		const physical = this.physical;
		const items = this.parent.items;
		const dominantSpecies = items.documentsByType?.metaSpecies?.[0] ?? false; //! Ayto kanw gia ta dominant traits?
		if (!dominantSpecies) return;
		//todo na kanw return edw ean den exei akoma species?
		const templates = items.documentsByType.template;
		metanthropes.utils.metaLog(4, "Actor DM Base", physical);
		//* Life
		const progressionStep = dominantSpecies?.system?.resources?.life?.progressionStep ?? 0;
		const progressionGain = dominantSpecies?.system?.resources?.life?.progressionGain ?? 0;
		let lifeInitial = dominantSpecies?.system?.resources?.life?.initial ?? 0;
		for (const item of templates) lifeInitial += item?.system?.resources?.life?.initial ?? 0; //! Ayto kanw gia ola ta ypoloipa initial stats
		//! doing this so it won't show Life NaN/NaN until a species is added to the actor, is there a better way?
		if (progressionStep > 0) {
			life.progressed = Math.floor(this.exp.total / progressionStep) * progressionGain; //? Extra gain Life for each step EXP Total
		} else {
			life.progressed = 0;
		}
		life.base = lifeInitial + life.progressed;

		//* Actions
		main.base = 0;
		extra.base = 0;
		reaction.base = 0;

		//* EXP
		this.exp.stored = this.exp.total - this.exp.spent;
		if (this.exp.stored < 0) metanthropes.utils.metaLog(2, "Actor DM Base", this.name, "Stored EXP is Negative!");

		//* Chars
		for (const charKey of Object.keys(CHARS)) {
			let charTemplate = 0;
			for (const item of templates) charTemplate += item?.system?.chars[charKey]?.initial ?? 0;
			this.chars[charKey].base = this.chars[charKey].initial + charTemplate + this.chars[charKey].progressed * 5;
		}

		//* Stats + base char
		for (const [statKey, statData] of Object.entries(STATS)) {
			let statTemplate = 0;
			for (const item of templates) statTemplate += item?.system?.stats[statKey]?.initial ?? 0;
			this.stats[statKey].base =
				this.chars[statData.associatedChar].base + //ayto na paei derived instead kai na vazw to current
				this.stats[statKey].initial +
				statTemplate + //!potential hole here if negative ammount from archetype > base that turns it into negative?
				this.stats[statKey].progressed * 5;
			//! or do we keep this base value with base char here, so we can use this as the input for EXP calculation?
		}
	}

	//* Derived values after Active Effects applied | Current: Base + Buffs - Conditions
	prepareDerivedData() {
		super.prepareDerivedData();

		const { CHARS, STATS, TABLES } = metanthropes.system;
		const { life, movement } = this.resources;
		const { main, extra, reaction } = this.actions;
		//const { speed, weight, size } = this.physical; //! assigned to const error?
		const physical = this.physical;
		const buffs = this.buffs;
		const conditions = this.conditions;

		const items = this.parent.items;
		//const dominantSpecies = items.documentsByType.species[0]; //original
		const dominantSpecies = items.documentsByType?.metaSpecies?.[0] ?? false;
		if (!dominantSpecies) return;
		metanthropes.utils.metaLog(4, "Actor DM Derived", dominantSpecies);
		const templates = items.documentsByType.template;

		//* Dominant Species (the first Species applied to the Actor)
		//todo CHARS, STATS, SPEED, WEIGHT, SIZE exoune BUFF/CONDITION
		//todo gia na vrw to current = base?/initial? + BUFF *5 - CONDITION *5
		//* SPEED, SIZE, WEIGHT
		physical.speed = 10 + buffs.speed - conditions.speed;
		physical.size = 10 + buffs.size - conditions.size;
		physical.weight = 10 + buffs.weight - conditions.weight;

		//* Life
		//todo: how to handle Duplicates? see _prepareDerivedVitalData(actorData) in old actor
		life.max = life.base + this.stats.endurance.current + TABLES.SIZE[physical.size].life; // + metaConstitution + substanceImitation + controlDensityTemp
		life.current = Math.min(life.current, life.max);
		life.value = life.current; //? Life as a resource bar

		//* Movement
		movement.max = Math.ceil(
			TABLES.SPEED[physical.speed].movement *
				TABLES.SIZE[physical.size].movement *
				TABLES.WEIGHT[physical.weight].movement -
				conditions.creativity,
		); //control kinetic energy removes 1d10 movement from target and adds to my own (current/total) for a duration
		//dark energy projection: I steal your accelerated buff level and add it to me
		movement.additional = movement.max;
		movement.sprint = movement.max * 5;
		movement.current = Math.min(movement.current, movement.max);
		movement.value = movement.current; //? Movement as resource bar

		//* Actions
		main.max = main.base; //+ metapower -- does species limit the max?
		extra.max = extra.base;
		reaction.max = reaction.base;
		//derived actions, define max math.min

		//* Chars
		//todo we want to keep the ifCharGoesToZero value vs defined min=0, leave it undefined?
		//* Chars
		for (const charKey of Object.keys(CHARS)) {
			let ifCharGoesNegative = 0; //keep the actual value here and use that instead?
			//! is this valid workaround for min 0 requirement for .current?
			this.chars[charKey].actual = this.chars[charKey].base + buffs[charKey] - conditions[charKey];
			this.chars[charKey].current = this.chars[charKey].actual;
		}

		//* Stats + base char
		for (const [statKey, statData] of Object.entries(STATS)) {
			this.stats[statKey].current =
				this.chars[statData.associatedChar].actual +
				this.stats[statKey].base +
				buffs[statKey] -
				conditions[statKey];
		}
	}
}

//* Schema Components
const { HTMLField, SchemaField, NumberField, StringField, BooleanField, ArrayField } = foundry.data.fields;
const standardScore = { required: true, nullable: false, integer: true, min: 0, initial: 1 }; //? Used in most cases
const levelScore = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 }; //? Used where we have Levels
const physicalScore = { required: true, nullable: false, integer: true, min: 0, initial: 10, max: 20 }; //? Used for Speed, Size, Weight
const initialDiceNumber = { required: true, nullable: false, integer: true, min: 1, initial: 1 };

//* * Resources
function defineResources() {
	return new SchemaField({
		life: new SchemaField({
			current: new NumberField({ ...standardScore }),
		}),
		movement: new SchemaField({
			current: new NumberField({ ...standardScore }),
		}),
	});
}

//* * Actions
function defineActions() {
	return new SchemaField({
		main: new SchemaField({
			current: new NumberField({ ...standardScore }),
		}),
		extra: new SchemaField({
			current: new NumberField({ ...standardScore }),
		}),
		reaction: new SchemaField({
			current: new NumberField({ ...standardScore }),
		}),
	});
}

//* * EXP
function defineEXP() {
	return new SchemaField({
		progressionLog: new ArrayField(
			new SchemaField({
				something: new NumberField(),
			}),
		), //?this keeps the progression order
		total: new NumberField({ ...standardScore }),
		spent: new NumberField({ ...standardScore }),
	});
}

//* * Physical
function definePhysical(TABLES) {
	return new SchemaField({
		description: new SchemaField({
			player: new HTMLField(),
			//todo species defined
		}),
		speed: new NumberField({ ...physicalScore }),
		weight: new NumberField({ ...physicalScore }),
		size: new NumberField({ ...physicalScore }),
		resistances: new SchemaField(
			Object.fromEntries(
				Object.keys(TABLES.ENERGY).map((energyKey) => [energyKey, new NumberField({ ...standardScore })]),
			),
		),
		immunities: new SchemaField(
			Object.fromEntries(Object.keys(TABLES.ENERGY).map((energyKey) => [energyKey, new BooleanField()])),
		),
		shift: new SchemaField({}),
		hitbox: new SchemaField({}), //? From Species
		origin: new SchemaField({}), //? From Species
	});
}

//* * Chars
function defineChars(CHARS) {
	return new SchemaField(
		Object.fromEntries(
			Object.keys(CHARS).map((charKey) => [
				charKey,
				new SchemaField({
					current: new NumberField({ ...standardScore }),
					initial: new NumberField({ ...standardScore }),
					initialChoice: new NumberField({ ...standardScore }),
					progressed: new NumberField({ ...levelScore }),
					progressionLog: new ArrayField(
						new SchemaField({
							char: new StringField(),
						}),
					),
				}),
			]),
		),
	);
}

//* * Stats
function defineStats(STATS) {
	return new SchemaField(
		Object.fromEntries(
			Object.keys(STATS).map((statKey) => [
				statKey,
				new SchemaField({
					current: new NumberField({ ...standardScore }),
					initial: new NumberField({ ...standardScore }),
					initialDice: new NumberField({ ...initialDiceNumber }),
					progressed: new NumberField({ ...levelScore }),
					progressionLog: new ArrayField(
						new SchemaField({
							stat: new StringField(),
						}),
					),
				}),
			]),
		),
	);
}

//* * Buffs
function defineBuffs(BUFFS) {
	return new SchemaField(
		Object.fromEntries(Object.keys(BUFFS).map((buffKey) => [buffKey, new NumberField({ ...levelScore })])),
	);
}

//* * Conditions
function defineConditions(CONDITIONS) {
	return new SchemaField(
		Object.fromEntries(
			Object.keys(CONDITIONS).map((conditionKey) => [conditionKey, new NumberField({ ...levelScore })]),
		),
	);
}

//* * Core Conditions
function defineCoreConditions(CORECONDITIONS) {
	return new SchemaField(
		Object.fromEntries(
			Object.keys(CORECONDITIONS).map((coreConditionKey) => [
				coreConditionKey,
				new NumberField({ ...levelScore }),
			]),
		),
	);
}

//* * Perks
function definePerks() {
	return new SchemaField({});
}

//* * Notes
function defineNotes() {
	return new SchemaField({});
}
