import { metaLogDocument } from "../helpers/metahelpers.mjs";
//* Add header buttons on the Actor, Item & Effect sheets for Advanced Logging
//? from TyphonJS (Michael) on Discord - You may have to get specific for particular sheets as some don't invoke hooks for the whole hierarchy.
Hooks.on(`getActorSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getItemSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectConfigHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectSheetHeaderButtons`, metaLogDocument);