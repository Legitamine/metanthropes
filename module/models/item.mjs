export default class MetanthropesItemBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ITEM"];
	static defineSchema() {
		return {
			description: new foundry.data.fields.HTMLField(),
		};
	}

	prepareBaseData() {
		super.prepareBaseData();
	}

	prepareDerivedData() {
		super.prepareBaseData();
	}
}
