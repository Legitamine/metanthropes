/**
 * @import { ResolutionApplicationConfig, ResolutionTargetMap } from "./_types.d.ts";
 */

const { ArrayField, BooleanField, ObjectField, SchemaField } = foundry.data.fields;

/**
 * Chat message type for resolving actions.
 * @extends foundry.abstract.TypeDataModel
 */
export default class ResolutionData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      resolution: new SchemaField({
        autoresolve: new BooleanField({ initial: true }),
        resolved: new BooleanField({ gmOnly: true }),
        resolvers: new ArrayField(new ObjectField()),
      }),
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (game.user.isActiveGM && this.resolution.autoresolve && !this.resolution.resolved) this.resolve();
  }

  /* -------------------------------------------------- */

  /**
   * Resolve the action, applying damage, healing, effects, etc.
   * @param {object} [options={}]
   * @param {boolean} [options.animations=true]   Play animations?
   * @param {boolean} [options.operations=true]   Apply operations?
   * @returns {Promise<foundry.documents.ChatMessage>}
   */
  async resolve({ animations = true, operations = true } = {}) {
    if (!game.user.isGM) throw new Error("Only a GM can resolve an action.");
    if (this.resolved) throw new Error("This action has already been resolved.");

    const data = await this._toApplication();

    if (operations) {
      await foundry.documents.modifyBatch(data.operations);
    }

    if (animations) {
      // TODO: play animations from data.animations.
    }

    return this.parent;
  }

  /* -------------------------------------------------- */

  /**
   * Construct the DatabaseWriteOperations for resolving the action.
   * @returns {Promise<ResolutionApplicationConfig>}
   */
  async _toApplication() {
    /** @type {ResolutionApplicationConfig["operations"]} */
    const operations = [];

    /** @type {ResolutionApplicationConfig["animations"]} */
    const animations = [];

    /**
     * Targets affected; a clone if the target is updated; `null` if the target is *deleted*; otherwise `undefined`.
     * @type {ResolutionTargetMap>}
     */
    const targets = new Map();

    for (const { type, ...data } of this.resolution.resolvers) {
      switch (type) {
        case "applyDamage":
          this.#resolveApplyDamage(targets, data);
          break;
      }
    }

    operations.push({
      action: "update",
      documentName: "ChatMessage",
      updates: [{ _id: this.parent.id, "system.resolution.resolved": true }],
    });

    for (const [uuid, target] of targets.entries()) {
      const original = fromUuidSync(uuid);
      const { pack, parent, documentName } = original;

      if (target === null) {
        operations.push({
          action: "delete",
          documentName, pack, parent,
          ids: [original.id],
        });
      } else if (target) {
        const diff = foundry.utils.diffObject(original.toObject().system, target.toObject().system);
        operations.push({
          action: "update",
          documentName, pack, parent,
          updates: [{ _id: original.id, system: diff }],
        });
      }
    }

    return { animations, operations };
  }

  /* -------------------------------------------------- */

  /**
   * Get a clone of a specific target. If not in the map yet, create a clone.
   * @param {ResolutionTargetMap} targets
   * @param {string} uuid
   * @returns {foundry.abstract.Document | null}
   */
  #getTarget(targets, uuid) {
    if (targets.has(uuid)) return targets.get(uuid);
    const clone = fromUuidSync(uuid).clone({}, { keepId: true });
    targets.set(uuid, clone);
    return clone;
  }

  /* -------------------------------------------------- */

  /**
   * Resolve damage application.
   * @param {ResolutionTargetMap} targets
   * @param {{ uuids: string[], damages: DamageConfig[] }} data
   * @returns {void}
   */
  #resolveApplyDamage(targets, data) {
    const uuids = new Set(data.uuids);
    for (const uuid of uuids) {
      const actor = this.#getTarget(targets, uuid);
      const operation = actor.system._applyDamageOperation(data.damages);
      actor.updateSource(operation.updates[0]);
    }
  }
}
