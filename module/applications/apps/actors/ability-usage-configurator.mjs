const { Application, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Configuration class for using a metapower ability.
 */
export default class AbilityUsageConfigurator extends HandlebarsApplicationMixin(Application) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    tag: "form",
    resolve: null,
    item: null,
    configs: null,
    position: {
      width: 400,
      height: "auto",
    },
    form: {
      closeOnSubmit: true,
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.buttons = [{ label: "COMMON.Confirm", icon: "fa-solid fa-check", type: "submit" }];
    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  close(options = {}) {
    this.options.resolve?.(!!options.submitted);
    return super.close(options);
  }
}
