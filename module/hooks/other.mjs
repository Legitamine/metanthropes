import { metaLogDocument, metaLogDocumentV2 } from "../api/utils/log-tools.mjs";
//* Add header buttons on the Actor, Item & Effect sheets for Advanced Logging
//* from TyphonJS (Michael) on Discord - You may have to get specific for particular sheets as some don't invoke hooks for the whole hierarchy.
//? For AppV1 sheets
Hooks.on(`getActorSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getItemSheetHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectConfigHeaderButtons`, metaLogDocument);
Hooks.on(`getActiveEffectSheetHeaderButtons`, metaLogDocument);
//?See [this issue for AppV2](https://github.com/foundryvtt/foundryvtt/issues/11668) sheets.
//todo this should probably be part of the new AppV2 document/sheet (?) rather than this hook here?
Hooks.on(`getHeaderControlsMetanthropesActorSheetV2`, metaLogDocumentV2);
Hooks.on(`getHeaderControlsMetanthropesActiveEffectSheetV2`, metaLogDocumentV2);
//* Other