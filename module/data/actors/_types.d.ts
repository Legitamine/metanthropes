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

declare module "./character.mjs" {
  export default interface CharacterData {
    attributes: {
      characteristics: Record<"body" | "mind" | "soul", Attribute>;
      stats: Record<string, Attribute>;
      speed: { value: number };
      weight: { value: number };
      size: { value: number };
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
