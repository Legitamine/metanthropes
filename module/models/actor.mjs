const { HTMLField, SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;
const standardNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0 };
const scoreNumber = { required: true, nullable: false, integer: true, min: 0, initial: 0, max: 5 }; //todo choices, step?
const initialDiceNumber = { required: true, nullable: false, integer: true, min: 0, initial: 1, max: 3 };

export default class MetanthropesActorV2 extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR"];
	static defineSchema() {
		return {
			resources: new SchemaField({
				life: new SchemaField({
					current: new NumberField({ ...standardNumber }),
				}),
				movement: new SchemaField({
					current: new NumberField({ ...standardNumber }),
				}),
			}),
			actions: new SchemaField({
				main: new SchemaField({
					current: new NumberField({ ...standardNumber }),
				}),
				extra: new SchemaField({
					current: new NumberField({ ...standardNumber }),
				}),
				reaction: new SchemaField({
					current: new NumberField({ ...standardNumber }),
				}),
			}),
			exp: new SchemaField({
				progressionLog: new ArrayField(
					new SchemaField({
						something: new NumberField(),
					}),
				), //?this keeps the progression order
				total: new NumberField({ ...standardNumber }),
				spent: new NumberField({ ...standardNumber }),
			}),
			physical: new SchemaField({
				description: new SchemaField({
					player: new HTMLField(),
					//todo species defined
				}),
				speed: new SchemaField({}),
				weight: new SchemaField({}),
				size: new SchemaField({}),
				shift: new SchemaField({}),
				resistances: new SchemaField({}),
				immunities: new SchemaField({}),
				hitbox: new SchemaField({}), //? From Species
				origin: new SchemaField({}), //? From Species
			}),
			chars: new SchemaField(
				Object.keys(metanthropes.system.CHARS).reduce((obj, charKey) => {
					//todo review const structure/usage - link to journal page - can I have it as a hint, click for more within the tooltip?
					obj[charKey] = new SchemaField({
						current: new NumberField({ ...standardNumber }),
						initial: new NumberField({ ...standardNumber }),
						initialChoice: new NumberField({ ...standardNumber }), //need to define how we work with the choices here
						progressed: new NumberField({ ...scoreNumber }),
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
				Object.keys(metanthropes.system.STATS).reduce((obj, statKey) => {
					obj[statKey] = new SchemaField({
						current: new NumberField({ ...standardNumber }),
						initial: new NumberField({ ...standardNumber }),
						initialDice: new NumberField({ ...initialDiceNumber }),
						progressed: new NumberField({ ...scoreNumber }),
						progressionLog: new ArrayField(
							new SchemaField({
								stat: new StringField(),
							}),
						),
						//todo progressed / max via derived?
					});
					return obj;
				}, {}),
			),
			buffs: new SchemaField({}),
			conditions: new SchemaField({}),
			perks: new SchemaField({}),
			notes: new SchemaField({}),
		};
	}

	//* Base = Initial (from Species/Archetypes) + Progressed
	prepareBaseData() {
		super.prepareBaseData();

		metanthropes.utils.metaLog(3, "Actor DM Base", this);

		const { life, movement } = this.resources;
		const { main, extra, reaction } = this.actions;

		const items = this.parent.items;
		const species = items.documentsByType.species[0];
		const archetypes = items.documentsByType.archetype;

		//* Life
		let lifeInitial = species?.system.resources.life.initial ?? 0;
		for (const item of archetypes) {
			const lifeArchetypeModifier = item?.system.resources.life.initial ?? 0;
			lifeInitial += lifeArchetypeModifier;
		}
		//todo these values could come from the species? or does it apply only to Metanthropes aka Archetype?
		life.progressed = Math.floor(this.exp.total / 5000) * 25; //? 25 extra Life for each 5K EXP Total
		life.base = lifeInitial + life.progressed; //! size should be applied to the base life or the derived? do we care?

		//* Movement
		movement.base = 0;

		//* Actions
		main.base = 0;
		extra.base = 0;
		reaction.base = 0;

		//* EXP
		this.exp.stored = this.exp.total - this.exp.spent;
		if (this.exp.stored < 0) metanthropes.utils.metaLog(2, "Actor DM Base", "Stored EXP is Negative!", this.name);

		//* Chars
		for (const charKey of Object.keys(metanthropes.system.CHARS)) {
			let charArchetype = 0;
			for (const item of archetypes) {
				charArchetype += item?.system.chars[charKey].initial ?? 0;
			}
			this.chars[charKey].base = this.chars[charKey].initial + charArchetype + this.chars[charKey].progressed * 5;
		}

		//* Stats + base char
		for (const [statKey, statData] of Object.entries(metanthropes.system.STATS)) {
			let statArchetype = 0;
			for (const item of archetypes) {
				statArchetype += item?.system.stats[statKey].initial ?? 0;
			}
			this.stats[statKey].base =
				this.chars[statData.associatedChar].base +
				this.stats[statKey].initial +
				statArchetype +
				this.stats[statKey].progressed * 5;
		}
	}

	//* Derived values after Active Effects haven applied | Current: Base + Buffs - Conditions
	prepareDerivedData() {
		super.prepareDerivedData();

		metanthropes.utils.metaLog(3, "Actor DM Derived", this);

		const { life, movement } = this.resources;
		const { main, extra, reaction } = this.actions;

		const items = this.parent.items;
		const species = items.documentsByType.species[0];
		const archetypes = items.documentsByType.archetype;

		//* Life
		//todo: do I need a life.value to make it work as a bar? or just define life.current in system.json?
		//todo: how to handle Duplicates? see _prepareDerivedVitalData(actorData) in old actor
		life.max = life.base + this.stats.endurance.current; //+ size modifier + metaLifeProgression + metaConstitution + substanceImitation + controlDensityTemp
		life.current = Math.min(life.current, life.max);

		//* Movement
		movement.max = movement.base; //could an effect change the max? yes, so what would happen here?
		movement.current = Math.min(movement.current, movement.max); //do we need this? can someone get +movement.current somehow?

		//* Actions
		main.max = main.base; //+ metapower -- does species limit the max?
		extra.max = extra.base;
		reaction.max = reaction.base;
		//derived actions, define max math.min
	}
}
