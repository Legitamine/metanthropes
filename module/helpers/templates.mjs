/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return loadTemplates([
		// Actor partials.
		"systems/metanthropes-system/templates/helpers/actor-combos.hbs",
		"systems/metanthropes-system/templates/helpers/actor-effects.hbs",
		"systems/metanthropes-system/templates/helpers/actor-metapowers.hbs",
		"systems/metanthropes-system/templates/helpers/actor-perks.hbs",
		"systems/metanthropes-system/templates/helpers/actor-possessions.hbs",
		"systems/metanthropes-system/templates/helpers/actor-charstats.hbs",
		"systems/metanthropes-system/templates/helpers/actor-notes.hbs",
		"systems/metanthropes-system/templates/helpers/actor-summary.hbs",
	]);
};
