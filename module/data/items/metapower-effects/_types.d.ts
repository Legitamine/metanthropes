export {};

interface SpendingData {
  /** Is spending allowed? */
  enabled: boolean;
  /** The cost to scale up the effect by one. */
  cost: number;
  /** The addition made at each step. */
  step: number;
}

declare module "./metapower-effect.mjs" {
  export default interface MetapowerEffect {
    id: string;
  }
}

declare module "./damage.mjs" {
  export default interface DamageEffect {
    type: "damage";
    damage: {
      type: "cosmic" | "elemental" | "material" | "psychic";
      /** The number of d10s to be rolled. */
      number: number;
      /** Additional bonus added on top of the roll. */
      base: number | null;
      spending: SpendingData;
    }
  }
}

declare module "./healing.mjs" {
  export default interface HealingEffect {
    type: "healing";
    healing: {
      /** The number of d10s to be rolled. */
      number: number;
      /** Additional bonus added on top of the roll. */
      base: number | null;
      spending: SpendingData;
    }
  }
}

declare module "./status.mjs" {
  export default interface StatusEffect {
    type: "status";
    status: {
      /** The key for the buff or condition. */
      id: string;
      /** The level of the buff or condition. */
      level: number;
      spending: SpendingData;
    }
  }
}
