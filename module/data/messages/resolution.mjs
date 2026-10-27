/**
 * @import { ResolutionApplicationConfig } from "./_types.d.ts";
 */

const { ArrayField, BooleanField, DocumentUUIDField, SchemaField } = foundry.data.fields;

/**
 * Chat message type for resolving actions.
 * @extends foundry.abstract.TypeDataModel
 */
export default class ResolutionData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      resolved: new BooleanField({ gmOnly: true }),
      resolution: new SchemaField({
        targets: new ArrayField(new SchemaField({
          uuid: new DocumentUUIDField({ type: "Actor" }),
        })),
      }),
    };
  }

  /* -------------------------------------------------- */

  /**
   * Targets of the action performed.
   * @yields {foundry.documents.Actor}
   */
  * targets() {
    const actors = new Set(); // A set used to ensure the same actor is not appearing twice.
    for (const { uuid } of this.resolution.targets) {
      const actor = fromUuidSync(uuid, { strict: false });
      if (!actor || actors.has(actor)) continue;
      actors.add(actor);
      yield actor;
    }
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

    const data = await this._toOperations();

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
  async _toOperations() {
    /** @type {ResolutionApplicationConfig["operations"]} */
    const operations = [];

    /** @type {ResolutionApplicationConfig["animations"]} */
    const animations = [];

    // TODO: iterate over resolvers.

    operations.push({
      action: "update",
      documentName: "ChatMessage",
      updates: [{ _id: this.parent.id, "system.resolved": true }],
    })

    return { animations, operations };
  }
}
