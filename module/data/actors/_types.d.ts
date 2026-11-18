import MetanthropesActor from "../../documents/actor.mjs";

export {};

export interface DamageConfig {
  type: "cosmic" | "elemental" | "material" | "psychic";
  value: number;
  options?: {
    /** Is resistance ignored? Default false. */
    ignoreResistance?: boolean;
  };
}

interface Characteristic {
  /** The base value.. */
  base: number;
  /** Level of the relevant applied buff. */
  buffs: number;
  /** Level of the relevant applied condition. */
  debuffs: number;
  /** How many times has this been progressed? */
  progressions: number;
  /** The final value after buffs, debuffs, and progression are applied. */
  value: number;
}

interface Stat {
  /** The base value.. */
  base: number;
  /** Level of the relevant applied buff. */
  buffs: number;
  /** Level of the relevant applied condition. */
  debuffs: number;
  /** The characteristic this stat uses. */
  characteristic: "body" | "mind" | "soul";
  /** How many times has this been progressed? */
  progressions: number;
  /** The final value after buffs, debuffs, and progression are applied. */
  value: number;
}

interface Defense {
  cover: number;
  immunity: number | null;
  resistance: number | null;
}

interface Perk {
  /** Perk value. */
  value: 0 | 1 | 2 | 3 | 4 | 5;
}

interface PhysicalAttribute {
  /** Base value. */
  base: number;
  /** Delta from statuses. */
  statuses: number;
  /** Modifier read from the config. */
  modifier: number;
  /** Total attribute (value + modifier), clamped between 0 and 20. */
  value: number;
}

declare module "./character.mjs" {
  export default interface CharacterData {
    parent: MetanthropesActor;
    attributes: {
      characteristics: Record<"body" | "mind" | "soul", Characteristic>;
      stats: Record<string, Stat>;
      speed: PhysicalAttribute;
      weight: PhysicalAttribute;
      size: PhysicalAttribute;
    };
    defenses: Record<"cosmic" | "elemental" | "material" | "psychic", Defense>;
    details: {
      age: number;
      /** Place of birth. */
      birth: string;
      gender: string;
      height: {
        value: number;
        units: "cm" | "ft";
      };
      weight: {
        value: number;
        units: "kg" | "lb";
      };
    };
    metapowers: {
      /** The character's prime metapower classification. */
      prime: string;
      levels: Record<string, number>;
    };
    /** Knowledges and skills. */
    perks: Record<string, Perk>;
    resources: {
      destiny: {
        value: number | null;
        max: number;
      };
      life: {
        value: number;
        max: number;
      };
    };
    /** The level of a status (buff or condition) the actor is affected by. */
    statuses: Record<string, number | null>;
  }
}
