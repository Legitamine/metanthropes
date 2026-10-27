const { TypedSchemaField } = foundry.data.fields;

/**
 * A data field for storing the effects of a metapower ability.
 * @extends foundry.data.fields.TypedObjectField
 */
export default class MetapowerEffectsField extends foundry.data.fields.TypedObjectField {
  constructor(options={}, context={}) {
    const element = new TypedSchemaField(metanthropes.data.items.metapowerEffects.MetapowerEffect.TYPES);
    options.validateKey = key => foundry.data.validators.isValidId(key);
    super(element, options, context);
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  initialize(value, model, options={}) {
    value = super.initialize(value, model, options);
    if (!value) return value;
    return Object.entries(value).reduce((acc, [id, data]) => {
      Object.defineProperty(data, "id", { get() { return id; } });
      return acc.set(id, data);
    }, new foundry.utils.Collection());
  }
}
