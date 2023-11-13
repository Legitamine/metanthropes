/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return loadTemplates([
		//? Actor partials
		"systems/metanthropes-system/templates/helpers/actor-header.hbs",
		"systems/metanthropes-system/templates/helpers/actor-navbar.hbs",
		"systems/metanthropes-system/templates/helpers/actor-summary.hbs",
		"systems/metanthropes-system/templates/helpers/actor-charstats.hbs",
		"systems/metanthropes-system/templates/helpers/actor-perks.hbs",
		"systems/metanthropes-system/templates/helpers/actor-metapowers.hbs",
		"systems/metanthropes-system/templates/helpers/actor-combos.hbs",
		"systems/metanthropes-system/templates/helpers/actor-possessions.hbs",
		"systems/metanthropes-system/templates/helpers/actor-active-effects.hbs",
		//? Actor Sheet
		"systems/metanthropes-system/templates/actor/actor-sheet.hbs",
		//? Item partials
		"systems/metanthropes-system/templates/helpers/item-description.hbs",
		"systems/metanthropes-system/templates/helpers/item-execution.hbs",
		"systems/metanthropes-system/templates/helpers/item-effects.hbs",
		//? Item Sheet
		"systems/metanthropes-system/templates/item/item-combo-sheet.hbs",
		"systems/metanthropes-system/templates/item/item-metapower-sheet.hbs",
		"systems/metanthropes-system/templates/item/item-Object-sheet.hbs",
		"systems/metanthropes-system/templates/item/item-possession-sheet.hbs",
		//? Actor Progression partials
		"systems/metanthropes-system/templates/progression/progression-sheet.hbs",
		"systems/metanthropes-system/templates/progression/progression-overview.hbs",
		"systems/metanthropes-system/templates/progression/progression-perks.hbs",
		"systems/metanthropes-system/templates/progression/progression-metapowers.hbs",
	]);
};
