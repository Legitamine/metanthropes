export {};

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
