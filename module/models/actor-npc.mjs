import MetanthropesActorBase from "./actor-base.mjs";

export default class MetanthropesActorNPC extends MetanthropesActorBase {

		static LOCALIZATION_PREFIXES = [
			...super.LOCALIZATION_PREFIXES,
			"METANTHROPES.ACTOR.NPC",
		];

		static defineSchema() {
			const schema = super.defineSchema();

			return schema;
		}
}