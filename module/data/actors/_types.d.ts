export {};

declare module "./character.mjs" {
  export default interface CharacterData {
    attributes: {
      characteristics: Record<"body" | "mind" | "soul", { value: number }>;
      stats: Record<string, { value: number }>;
    }
    defenses: {
      energy: Record<"cosmic" | "elemental" | "material" | "psychic", { cover: number; resistance: number | null }>;
    }
    resources: {
      destiny: {
        value: number | null;
        max: number;
      }
      health: {
        value: number;
        max: number;
      }
    }
    statuses: Record<string, number | null>;
  }
}
