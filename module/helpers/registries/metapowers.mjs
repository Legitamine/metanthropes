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

  /** @type {Map<string, { abilities: { level: number; uuid: string }[]; classification: string; uuid: string }>} */
  static #registry = new Map();

  /* -------------------------------------------------- */

  /**
   * Temporary cache of abilities before finalizing registry.
   * @type {object[] | void}
   */
  static _cache;

  /* -------------------------------------------------- */

  /**
   * Populate the metapowers registry.
   * @returns {Promise<void>}
   */
  static async populateRegistry() {
    if (MetapowersRegistry.#initialized) return;
    MetapowersRegistry._cache = [];
    for (const pack of game.packs) {
      if (pack.metadata.type !== "Item") continue;
      await pack.getIndex();
      for (const data of MetapowersRegistry.iteratePack(pack)) {
        if (data.type === "metapower") MetapowersRegistry.#registerMetapower(data);
        else if (data.type === "ability") MetapowersRegistry.#registerAbility(data);
      }
    }
    MetapowersRegistry.#finalizeAbilityRegistry();
    delete MetapowersRegistry._cache;
    MetapowersRegistry.#initialized = true;
  }

  /* -------------------------------------------------- */

  /**
   * Iterate over the index of a pack.
   * @param {CompendiumCollection} pack
   * @yields {
   *  { level: number; metapower: string; type: "ability"; uuid: string }
   *  | { identifier: string; classification: string; type: "metapower"; uuid: string }
   * }
   */
  static * iteratePack(pack) {
    for (const item of pack.index) {
      const { level, metapower, classification } = item.system?.category ?? {};


      if (item.type === "ability") {
        if (!level || level > 5) continue;
        if (!metapower) continue;

        yield { level, metapower, type: item.type, uuid: item.uuid };
      }

      if (item.type === "metapower") {
        const identifier = item.system.identifier || metanthropes.utils.createDefaultIdentifier(item.name);
        if (!identifier || !classification) continue;

        yield { identifier, classification, type: item.type, uuid: item.uuid };
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Register a metapower item.
   * @param {{ identifier: string; classification: string; type: "metapower"; uuid: string }}
   */
  static #registerMetapower({ identifier, classification, type, uuid }) {
    const r = MetapowersRegistry.#registry;
    if (r.has(identifier)) {
      console.warn(`Metapower with identifier '${identifier}' has already been registered.`);
      return;
    }
    r.set(identifier, { abilities: [], classification, uuid });
  }

  /* -------------------------------------------------- */

  /**
   * Store an ability to be registered after all metapowers are registered.
   * @param {{ level: number; metapower: string; type: "ability"; uuid: string }}
   */
  static #registerAbility({ level, metapower, type, uuid }) {
    MetapowersRegistry._cache.push({ level, metapower, type, uuid });
  }

  /* -------------------------------------------------- */

  /**
   * Register all metapower abilities.
   */
  static #finalizeAbilityRegistry() {
    const r = MetapowersRegistry.#registry;
    for (const { level, metapower, type, uuid } of MetapowersRegistry._cache) {
      if (!r.has(metapower)) {
        console.warn(`No metapower registered with identifier '${metapower}'.`);
        continue;
      }
      r.get(metapower).abilities.push({ level, uuid });
    }
  }

  /* -------------------------------------------------- */

  /**
   * Get metapower abilities of a specific classification, metapower, and level.
   * @param {{ metapower?: string; classification?: string; level?: number }} [query]
   * @returns {Set<string>}
   */
  static getAbilities(query={}) {
    const matchMetapower = m => !query.metapower || (m === query.metapower);
    const matchClassification = c => !query.classification || (c === query.classification);
    const matchLevel = l => !Number.isFinite(query.level) || (l === query.level);

    const uuids = new Set();
    for (const [m, data] of MetapowersRegistry.#registry.entries()) {
      if (!matchMetapower(m)) continue;
      if (!matchClassification(data.classification)) continue;

      for (const a of data.abilities) if (matchLevel(a.level)) uuids.add(a.uuid);
    }

    return uuids;
  }

  /* -------------------------------------------------- */

  /**
   * Get metapowers of a specific classification.
   * @param {{ classification?: string }} [query]
   * @returns {Set<string>}
   */
  static getMetapowers(query={}) {
    const matchClassification = c => !query.classification || (c === query.classification);
    const uuids = new Set();
    for (const [m, data] of MetapowersRegistry.#registry.entries()) {
      if (matchClassification(data.classification)) uuids.add(data.uuid);
    }
    return uuids;
  }
}
