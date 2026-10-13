export default class MetapowersRegistry {
  /**
   * Additional fields to index in compendiums for items.
   * @type {string[]}
   */
  static COMPENDIUM_FIELDS = [
    // Ability fields
    "system.category.level",
    "system.category.metapower",
    // Metapower fields
    "system.category.classification",
    "system.identifier",
  ];

  /* -------------------------------------------------- */

  /**
   * Has the registry been populated?
   * @type {boolean}
   */
  static #initialized = false;

  /* -------------------------------------------------- */

  /** @type {Record<string, Map<string, Set<string>>>} */
  static #registry = {
    classification: new Map(),
    metapower: new Map(),
    level: new Map(),
  }

  /* -------------------------------------------------- */

  /**
   * Populate the metapowers registry.
   * @returns {Promise<void>}
   */
  static async populateRegistry() {
    if (MetapowersRegistry.#initialized) return;
    for (const pack of game.packs) {
      if (pack.metadata.type !== "Item") continue;
      await pack.getIndex();

      for (const i of pack.index) {
        if (i.type !== "metapower") continue;

        // TODO: These property paths are merely placeholders and subject to change.
        const { value: cls, metapower, level } = i.system.classification;
        if (!cls || !metapower || !level) continue;

        MetapowersRegistry.#registry.classification.getOrInsert(cls, new Set()).add(i.uuid);
        MetapowersRegistry.#registry.metapower.getOrInsert(metapower, new Set()).add(i.uuid);
        MetapowersRegistry.#registry.level.getOrInsert(level, new Set()).add(i.uuid);
      }
    }
    MetapowersRegistry.#initialized = true;
  }

  /* -------------------------------------------------- */

  /**
   * Get metapowers of a specific classification, subtype, and level.
   * @param {{ classification: string; metapower: string; level: number }} query
   * @returns {Set<string>}
   */
  static get(query) {
    query = { ...query };
    const r = MetapowersRegistry.#registry;

    for (const k of ["classification", "metapower", "level"]) {
      // If a query is passed but the key is not valid, return early.
      if (!!query[k] && !r[k].has(query[k])) return new Set();

      // Else use the full set of uuids if the key was omitted.
      else if (!query[k]) query[k] = null;

      // Else use the subset of matches.
      else query[k] = r[k].get(query[k]);
    }

    let s = null;
    for (const k of ["classification", "metapower", "level"]) {
      if (query[k] === null) continue; // Not filtered.
      if (s) s = s.intersection(query[k]);
      else s = query[k];
    }
    return s ?? new Set();
  }
}

/* -------------------------------------------------- */

Hooks.once("init", () => {
  CONFIG.Item.compendiumIndexFields.push(...MetapowersRegistry.COMPENDIUM_FIELDS);
});

Hooks.once("ready", () => {
  MetapowersRegistry.populateRegistry();
});
