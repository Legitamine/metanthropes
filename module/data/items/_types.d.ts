import Collection from "@common/utils/collection.mjs";
import MetapowerEffect from "./metapower-effects/metapower-effect.mjs";

export {};

/**
 * Scaling data for a metapower ability; a mapping of the metapower effects to the scaling steps applied.
 */
export interface Scaling {
  [effectId: string]: number;
}

declare module "./ability.mjs" {
  export default interface AbilityData {
    activation: {
      cost: number | null;
    }
    category: {
      level: number;
      metapower: string;
    }
    description: {
      value: string;
    }
    effects: Collection<string, MetapowerEffect>;
  }
}

declare module "./metapower.mjs" {
  export default interface MetapowerData {
    activation: {
      stat: string;
    }
    category: {
      classification: string;
      energy: string;
    }
    description: {
      value: string;
    }
    identifier: string;
  }
}
