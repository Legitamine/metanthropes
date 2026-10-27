export interface CharacteristicConfig {
  label: string;
  buff: string;
  condition: string;
}

export interface StatConfig {
  label: string;
  characteristic: "body" | "mind" | "soul";
  buff: string;
  condition: string;
}

export interface ClassificationConfig {
  label: string;
}

export interface MetapowerConfig {
  label: string;
  group: string;
}

export interface EnergyTypeConfig {
  label: string;
}

export interface PerkConfig {
  label: string;
  type: "knowledge" | "skill";
}
