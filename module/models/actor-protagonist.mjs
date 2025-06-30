import MetanthropesActorBase from "./actor-base.mjs";

export default class MetanthropesActorProtagonist extends MetanthropesActorBase {

		static LOCALIZATION_PREFIXES = [
			...super.LOCALIZATION_PREFIXES,
			"METANTHROPES.ACTOR.PROTAGONIST",
		];

		static defineSchema() {
			const schema = super.defineSchema();

			return schema;
		}
}