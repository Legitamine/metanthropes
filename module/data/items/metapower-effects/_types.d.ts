export {};

declare module "./metapower-effect.mjs" {
  export default interface MetapowerEffect {
    id: string;
    type: "damage" | "healing";
  }
}

declare module "./damage.mjs" {
  export default interface DamageEffect extends MetapowerEffect {
    type: "damage";
    damage: {
      type: "cosmic" | "elemental" | "material" | "psychic";
      number: number;
      base: number | null;
    }
  }
}

declare module "./healing.mjs" {
  export default interface HealingEffect extends MetapowerEffect {
    type: "healing";
    healing: {
      number: number;
      base: number | null;
    }
  }
}
