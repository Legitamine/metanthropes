/**
 * Metanthropes region document subclass.
 * @extends foundry.documents.RegionDocument
 */
export default class MetanthropesRegionDocument extends foundry.documents.RegionDocument {
  /**
   * Create an aura attached to and surrounding a token.
   * @param {foundry.documents.TokenDocument} token
   * @returns {Promise<MetanthropesRegionDocument>}
   */
  static async createAura(token, { radius = 1 } = {}) {
    /** @type {foundry.documents.Scene} */
    const scene = token.parent;

    const center = token.getCenterPoint();
    const shapeData = {
      type: "circle",
      ...center,
      gridBased: true,
      radius: (scene.grid.distance * radius + scene.grid.distance / 2) * scene.dimensions.distancePixels,
    };
    const regionData = {
      name: "Aura",
      shapes: [shapeData],
      visibility: CONST.REGION_VISIBILITY.ALWAYS,
      attachment: { token: token.id },
      color: game.user.color,
      highlightMode: "coverage",
    };

    return this.create(regionData, { parent: scene });
  }
}
