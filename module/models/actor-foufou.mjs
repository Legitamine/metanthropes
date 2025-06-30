import MetanthropesActorBase from "./actor-base.mjs";

export default class MetanthropesActorFOUFOU extends MetanthropesActorBase {

		static LOCALIZATION_PREFIXES = [
			...super.LOCALIZATION_PREFIXES,
			"METANTHROPES.ACTOR.FOUFOU",
		];

		static defineSchema() {
			const schema = super.defineSchema();

			return schema;
		}
}