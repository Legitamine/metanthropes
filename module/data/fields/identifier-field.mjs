/**
 * Special case StringField that includes automatic validation for identifiers.
 * @extends foundry.data.fields.StringField
 */
export default class IdentifierField extends foundry.data.fields.StringField {
  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { required: true });
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _validateType(value) {
    if (!metanthropes.utils.isValidIdentifier(value)) {
      throw new Error(_loc("METANTHROPES.DATA.identifierError"));
    }
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  applyChange(value, model, change, { replacementData = {} } = {}) {
    return value;
  }
}
