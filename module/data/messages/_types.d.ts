import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";

export {};

/* -------------------------------------------------- */

/**
 * Resolution data to perform and animate when resolving an action.
 */
export interface ResolutionApplicationConfig {
  animations: object[];
  operations: DatabaseWriteOperation[];
}

/* -------------------------------------------------- */

declare module "./resolution.mjs" {
  export default interface ResolutionData {
    parent: foundry.documents.ChatMessage
    resolution: {
      targets: { uuid: string }[];
    }
    resolved: boolean;
  }
}
