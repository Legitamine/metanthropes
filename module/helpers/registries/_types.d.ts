export interface MetapowerRegistryData {
  type: "metapower";
  /** The classification of the metapower. */
  classification: string;
  /** The energy type of the metapower. */
  energy: string;
  /** The identifier of the metapower. */
  identifier: string;
  /** The uuid of the registered metapower. */
  uuid: string;
}

export interface MetapowerAbilityRegistryData {
  type: "ability";
  /** The level of the metapower ability. */
  level: number;
  /** The identifier of the parent metapower. */
  metapower: string;
  /** The uuid of the registered metapower ability. */
  uuid: string;
}
