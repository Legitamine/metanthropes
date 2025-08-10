export function metaRegisterCustomEnrichers() {
	const metaCustomEnrichers = [
		{
			pattern: /@METAFA\(\s*([^)]+)\s*\)/g,
			enricher: (match, options) => {
				const params = match[1].split(",").map((s) => s.trim());
				return metanthropes.utils.metaCreateFAIcon(...params);
			},
			replaceParent: false,
		},
		{
			pattern: /@METAICON\(\s*([^)]+)\s*\)/g,
			enricher: (match, options) => {
				const params = match[1].split(",").map((s) => s.trim());
				return metanthropes.utils.metaCreateCustomIcon(...params);
			},
			replaceParent: false,
		},
	];
	CONFIG.TextEditor.enrichers.push(...metaCustomEnrichers);
}
