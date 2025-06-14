import { metaLogDocument } from "../api/utils/log-tools.mjs";
//todo V13 has a solution for not being able to work with AppV2 sheets: https://github.com/foundryvtt/foundryvtt/issues/11668
//todo this should probably be part of the new AppV2 document/sheet (?) rather than this hook here?
//* Add header buttons on the Actor, Item & Effect sheets for Advanced Logging
//? from TyphonJS (Michael) on Discord - You may have to get specific for particular sheets as some don't invoke hooks for the whole hierarchy.
Hooks.on(`getActorSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getItemSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectConfigHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectSheetHeaderButtons`, metaLogDocument);