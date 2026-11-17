/**
 * @import { MetapowerRegistryData, MetapowerAbilityRegistryData } from "./_types.d.ts";
 */

/**
 * Registry class for storing references and data of metapowers and metapower abilities.
 */
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
    "system.category.energy",
    "system.identifier",
  ];

  /* -------------------------------------------------- */

  /**
   * Has the registry been populated?
   * @type {boolean}
   */
  static #initialized = false;

  /* -------------------------------------------------- */

  /** @type {Map<string, { MetapowerRegistryData & { abilities: MetapowerAbilityRegistryData[] } }>} */
  static #registry = new Map();

  /* -------------------------------------------------- */

  /**
   * Temporary cache of abilities before finalizing registry.
   * @type {MetapowerAbilityRegistryData[]}
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
   * @yields { MetapowerAbilityRegistryData | MetapowerRegistryData }
   */
  static * iteratePack(pack) {
    for (const item of pack.index) {
      const { level, metapower, classification, energy } = item.system?.category ?? {};


      if (item.type === "ability") {
        if (!level || level > 5) continue;
        if (!metapower) continue;

        yield {
          type: item.type,
          level: level,
          metapower: metapower,
          uuid: item.uuid,
        };
      }

      if (item.type === "metapower") {
        const identifier = item.system.identifier || metanthropes.utils.createDefaultIdentifier(item.name);
        if (!identifier || !classification || !energy) continue;

        yield {
          type: item.type,
          classification: classification,
          energy: energy,
          identifier: identifier,
          uuid: item.uuid,
        };
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Register a metapower item.
   * @param {MetapowerRegistryData} data
   */
  static #registerMetapower(data) {
    const r = MetapowersRegistry.#registry;
    if (r.has(data.identifier)) {
      console.warn(`Metapower with identifier '${data.identifier}' has already been registered.`);
      return;
    }
    r.set(data.identifier, { ...data, abilities: [] });
  }

  /* -------------------------------------------------- */

  /**
   * Store an ability to be registered after all metapowers are registered.
   * @param {MetapowerAbilityRegistryData} data
   */
  static #registerAbility(data) {
    MetapowersRegistry._cache.push({ ...data });
  }

  /* -------------------------------------------------- */

  /**
   * Register all metapower abilities.
   */
  static #finalizeAbilityRegistry() {
    const r = MetapowersRegistry.#registry;
    for (const data of MetapowersRegistry._cache) {
      if (!r.has(data.metapower)) {
        console.warn(`No metapower registered with identifier '${data.metapower}'.`);
        continue;
      }
      r.get(data.metapower).abilities.push({ ...data });
    }
  }

  /* -------------------------------------------------- */

  /**
   * Get metapower abilities of a specific classification, metapower, and level.
   * @param {{ metapower?: string; classification?: string; level?: number | number[] }} [query]
   * @returns {Set<string>}
   */
  static getAbilities(query={}) {
    const matchMetapower = m => !query.metapower || (m === query.metapower);
    const matchClassification = c => !query.classification || (c === query.classification);
    const matchLevel = l => {
      if (Array.isArray(query.level) && query.level.length) return query.level.includes(l);
      return !Number.isFinite(query.level) || (l === query.level);
    };

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

  /* -------------------------------------------------- */

  /**
   * Look up data for a metapower by identifier.
   * @param {string} identifier
   * @returns {MetapowerRegistryData & { abilities: MetapowerAbilityRegistryData[] } | null}
   */
  static lookupMetapower(identifier) {
    const data = this.#registry.get(identifier);
    if (data) return foundry.utils.deepClone(data);
    return null;
  }
}
