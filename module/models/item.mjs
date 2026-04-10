export default class MetanthropesItemBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["METANTHROPES.ITEM"];
	static defineSchema() {
		const f = foundry.data.fields; //? Fields
		const s = {}; //? Schema
		s.description = new f.HTMLField();
		return s;
	}

	prepareBaseData() {}

	prepareDerivedData() {}
}
