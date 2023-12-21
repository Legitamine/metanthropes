/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return loadTemplates([
		//? Actor partials
		"systems/metanthropes/templates/helpers/actor-header.hbs",
		"systems/metanthropes/templates/helpers/actor-navbar.hbs",
		"systems/metanthropes/templates/helpers/actor-summary.hbs",
		"systems/metanthropes/templates/helpers/actor-charstats.hbs",
		"systems/metanthropes/templates/helpers/actor-perks.hbs",
		"systems/metanthropes/templates/helpers/actor-metapowers.hbs",
		"systems/metanthropes/templates/helpers/actor-combos.hbs",
		"systems/metanthropes/templates/helpers/actor-possessions.hbs",
		"systems/metanthropes/templates/helpers/actor-active-effects.hbs",
		//? Actor Sheet
		"systems/metanthropes/templates/actor/actor-sheet.hbs",
		//? Item partials
		"systems/metanthropes/templates/helpers/item-description.hbs",
		"systems/metanthropes/templates/helpers/item-execution.hbs",
		"systems/metanthropes/templates/helpers/item-effects.hbs",
		"systems/metanthropes/templates/helpers/item-results.hbs",
		//? Item Sheet
		"systems/metanthropes/templates/item/item-combo-sheet.hbs",
		"systems/metanthropes/templates/item/item-metapower-sheet.hbs",
		"systems/metanthropes/templates/item/item-Object-sheet.hbs",
		"systems/metanthropes/templates/item/item-possession-sheet.hbs",
		//? Active Effect Sheet
		"systems/metanthropes/templates/helpers/active-effects.hbs",
		//? Actor Progression partials
		"systems/metanthropes/templates/progression/progression-sheet.hbs",
		"systems/metanthropes/templates/progression/progression-overview.hbs",
		"systems/metanthropes/templates/progression/progression-perks.hbs",
		"systems/metanthropes/templates/progression/progression-metapowers.hbs",
	]);
};
