const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
//todo choices, step?
const standardScore = { required: true, nullable: false, integer: true, min: 0, initial: 0 }; //? Used in most cases
const levelScore = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5, choices: [0,1,2,3,4,5] }; //? Used where we have Levels
const physicalScore = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 20 }; //? Used for Speed, Size, Weight
const initialDiceNumber = { required: true, nullable: false, integer: true, min: 1, initial: 1 };


export default class MetanthropesActorV2 extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR"];
	static defineSchema() {
		const { CHARS, STATS, BUFFS, CONDITIONS, CORECONDITIONS } = metanthropes.system;
		return {
			resources: new SchemaField({
				life: new SchemaField({
					current: new NumberField({ ...standardScore }),
				}),
				movement: new SchemaField({
					current: new NumberField({ ...standardScore }),
				}),
			}),
			actions: new SchemaField({
				main: new SchemaField({
					current: new NumberField({ ...standardScore }),
				}),
				extra: new SchemaField({
					current: new NumberField({ ...standardScore }),
				}),
				reaction: new SchemaField({
					current: new NumberField({ ...standardScore }),
				}),
			}),
			exp: new SchemaField({
				progressionLog: new ArrayField(
					new SchemaField({
						something: new NumberField(),
					}),
				), //?this keeps the progression order
				total: new NumberField({ ...standardScore }),
				spent: new NumberField({ ...standardScore }),
			}),
			physical: new SchemaField({
				description: new SchemaField({
					player: new HTMLField(),
					//todo species defined
				}),
				speed: new SchemaField({
					//! we don't define .initial here, so how do we tell it to use ...physicalScore validation?
					// species define the initial, so it gets the definition inherited somehow from there?
				}),
				weight: new SchemaField({}),
				size: new SchemaField({}),
				shift: new SchemaField({}),
				resistances: new SchemaField({}),
				immunities: new SchemaField({}),
				hitbox: new SchemaField({}), //? From Species
				origin: new SchemaField({}), //? From Species
			}),
			chars: new SchemaField(
				Object.keys(CHARS).reduce((obj, charKey) => {
					//todo review const structure/usage - link to journal page - can I have it as a hint, click for more within the tooltip?
					obj[charKey] = new SchemaField({
						current: new NumberField({ ...standardScore }),
						initial: new NumberField({ ...standardScore }),
						initialChoice: new NumberField({ ...standardScore }), //need to define how we work with the choices here
						progressed: new NumberField({ ...levelScore }),
						progressionLog: new ArrayField(
							new SchemaField({
								char: new StringField(),
							}),
						),
					});
					return obj;
				}, {}),
			),
			stats: new SchemaField(
				Object.keys(STATS).reduce((obj, statKey) => {
					obj[statKey] = new SchemaField({
						current: new NumberField({ ...standardScore }),
						initial: new NumberField({ ...standardScore }),
						initialDice: new NumberField({ ...initialDiceNumber }),
						progressed: new NumberField({ ...levelScore }),
						progressionLog: new ArrayField(
							new SchemaField({
								stat: new StringField(),
							}),
						),
					});
					return obj;
				}, {}),
			),
			buffs: new SchemaField(
				Object.keys(BUFFS).reduce((obj, buffKey) => {
					obj[buffKey] = new SchemaField({
						current: new NumberField({ ...levelScore }), //omit the .current for shorter path or keep it for consistency?
					});
					return obj;
				}, {}),
			),
			conditions: new SchemaField(
				Object.keys(CONDITIONS).reduce((obj, buffKey) => {
					obj[buffKey] = new SchemaField({
						current: new NumberField({ ...levelScore }),
					});
					return obj;
				}, {}),
			),
			coreConditions: new SchemaField({}),
			perks: new SchemaField({}),
			notes: new SchemaField({}),
		};
	}

	//* Base = Initial (from Species/Archetypes) + Progressed = einai ta stuff poy theloume gia progression!
	prepareBaseData() {
		super.prepareBaseData();
		const { CHARS, STATS } = metanthropes.system;
		const { life } = this.resources;
		const { main, extra, reaction } = this.actions;
		const { speed, weight, size } = this.physical;
		const items = this.parent.items;
		const species = items.documentsByType.species[0];
		const templates = items.documentsByType.template;

		//* Life
		const progressionStep = species?.system.resources.life.progressionStep ?? 0;
		const progressionGain = species?.system.resources.life.progressionGain ?? 0;
		let lifeInitial = species?.system.resources.life.initial ?? 0;
		for (const item of templates) lifeInitial += item?.system.resources.life.initial ?? 0;
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
		if (this.exp.stored < 0) metanthropes.utils.metaLog(2, "Actor DM Base", "Stored EXP is Negative!", this.name);

		//* SPEED, SIZE, WEIGHT
		speed.initial = species?.system.physical.speed.initial ?? 0;
		size.initial = species?.system.physical.size.initial ?? 0;
		weight.initial = species?.system.physical.weight.initial ?? 0;

		//* Chars
		for (const charKey of Object.keys(CHARS)) {
			let charTemplate = 0;
			for (const item of templates) charTemplate += item?.system.chars[charKey].initial ?? 0;
			this.chars[charKey].base = this.chars[charKey].initial + charTemplate + this.chars[charKey].progressed * 5;
		}

		//* Stats + base char
		for (const [statKey, statData] of Object.entries(STATS)) {
			let statTemplate = 0;
			for (const item of templates) statTemplate += item?.system.stats[statKey].initial ?? 0;
			this.stats[statKey].base =
				this.chars[statData.associatedChar].base + //ayto na paei derived instead kai na vazw to current
				this.stats[statKey].initial +
				statTemplate + //!potential hole here if negative ammount from archetype > base that turns it into negative?
				this.stats[statKey].progressed * 5;
			//! or do we keep this base value with base char here, so we can use this as the input for EXP calculation?
		}
	}

	//* Derived values after Active Effects haven applied | Current: Base + Buffs - Conditions
	prepareDerivedData() {
		super.prepareDerivedData();

		const { CHARS, STATS, TABLES } = metanthropes.system;
		const { life, movement } = this.resources;
		const { main, extra, reaction } = this.actions;
		const { speed, weight, size } = this.physical;
		const buffs = this.buffs;
		const conditions = this.conditions;

		const items = this.parent.items;
		const species = items.documentsByType.species[0];
		const templates = items.documentsByType.template;

		//todo CHARS, STATS, SPEED, WEIGHT, SIZE exoune BUFF/CONDITION
		//todo gia na vrw to current = base?/initial? + BUFF *5 - CONDITION *5
		//* SPEED, SIZE, WEIGHT
		speed.current = speed.initial + buffs.speed.current - conditions.speed.current;
		size.current = size.initial + buffs.size.current - conditions.size.current;
		weight.current = weight.initial + buffs.weight.current - conditions.weight.current;

		//* Life
		//todo: do I need a life.value to make it work as a bar? or just define life.current in system.json?
			//todo needs.value/.max in data field
		//todo: how to handle Duplicates? see _prepareDerivedVitalData(actorData) in old actor
		life.max = life.base + this.stats.endurance.current + TABLES.SIZE[buffs.size.current].life; // + metaConstitution + substanceImitation + controlDensityTemp
		life.current = Math.min(life.current, life.max);
		life.value = life.current;

		//* Movement
		movement.max = Math.ceil(
			TABLES.SPEED[buffs.speed.current].movement *
				TABLES.SIZE[buffs.size.current].movement *
				TABLES.WEIGHT[buffs.weight.current].movement -
				conditions.creativity.current,
		);
		movement.additional = movement.max;
		movement.sprint = movement.max * 5;
		movement.current = Math.min(movement.current, movement.max);

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
			this.chars[charKey].actual =
				this.chars[charKey].base + buffs[charKey].current - conditions[charKey].current;
			this.chars[charKey].current = this.chars[charKey].actual;
		}

		//* Stats + base char
		for (const [statKey, statData] of Object.entries(STATS)) {
			this.stats[statKey].current =
				this.chars[statData.associatedChar].actual +
				this.stats[statKey].base +
				buffs[statKey].current -
				conditions[statKey].current;
		}
	}
}
