export {};

interface Attribute {
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
  value: number;
  /** Delta from statuses. */
  statuses: number;
  /** Modifier read from the config. */
  modifier: number;
  /** Total attribute (value + modifier), clamped between 0 and 20. */
  total: number;
}

declare module "./character.mjs" {
  export default interface CharacterData {
    attributes: {
      characteristics: Record<"body" | "mind" | "soul", Attribute>;
      stats: Record<string, Attribute>;
      speed: PhysicalAttribute;
      weight: PhysicalAttribute;
      size: PhysicalAttribute;
    }
    defenses: Record<"cosmic" | "elemental" | "material" | "psychic", Defense>;
    details: {
      age: number;
      /** Place of birth. */
      birth: string;
      gender: string;
      height: { value: number; units: "cm" | "ft" }
      weight: { value: number; units: "kg" | "lb" }
    }
    /** Knowledges and skills. */
    perks: Record<string, Perk>;
    resources: {
      destiny: {
        value: number | null;
        max: number;
      }
      life: {
        value: number;
        max: number;
      }
    }
    /** The level of a status (buff or condition) the actor is affected by. */
    statuses: Record<string, number | null>;
  }
}
