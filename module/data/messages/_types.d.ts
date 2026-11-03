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

export type ResolutionTargetMap = Map<string, foundry.abstract.Document | null>;

/* -------------------------------------------------- */

declare module "./resolution.mjs" {
  export default interface ResolutionData {
    parent: foundry.documents.ChatMessage;
    resolution: {
      autoresolve: boolean;
      resolved: boolean;
      resolvers: object[];
    }
  }
}
