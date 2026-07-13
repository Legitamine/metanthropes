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
		{
			pattern: /@METALINK\(\s*["']?([^)"']+)["']?\s*\)/g,
			enricher: async (match, options) => {
				const param = match[1].trim();
				const result = await metanthropes.utils.metaLink(param);
				return result;
			},
		},
	];
	CONFIG.TextEditor.enrichers.push(...metaCustomEnrichers);
}
