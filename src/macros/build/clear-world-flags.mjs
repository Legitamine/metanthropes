//* Macro to be used in 'Composer' Worlds to clear 3rd party flags from Actors, Items and Scenes before importing to Compendiums
//* From #system-development channel on FVTT Discord (cheers to Zhell) * Untested

if (!game.user.isActiveGM) return ui.notifications.error("You are not the Active GM!");

const mL = metanthropes.utils.metaLog;

const batches = [];

const allowedScopes = ["core", "world", "metanthropes"];

const makeUpdate = (doc) => {
	const flags = foundry.utils.deepClone(doc.toObject().flags);
	Object.keys(flags).forEach((k) => {
		if (!allowedScopes.includes(k)) {
			if (k === "metanthropes") {
				mL(4, "Clean World Flags Macro", "Metanthropes Flag Detected",k, "Contents", flags[k]);
				return
			}
			mL(3, "Clean World Flags Macro", "Found Flags from", k, "Contents", flags[k]);
			delete flags[k];
		}
	});

	const existing = batches.find((b) => b.parent === doc.parent && b.documentName === doc.documentName);
	if (existing) existing.updates.push({ _id: doc.id, flags: _replace(flags) });
	else
		batches.push({
			parent: doc.parent,
			documentName: doc.documentName,
			action: "update",
			updates: [{ _id: doc.id, flags: _replace(flags) }],
		});
};

for (const documentName of ["Actor", "Item", "Scene"]) {
	const collection = game.collections.get(documentName);
	for (const doc of collection) {
		makeUpdate(doc);
		for (const [, e] of doc.traverseEmbeddedDocuments()) {
			makeUpdate(e);
		}
	}
}
if (batches.length > 0) {
	mL(3, "Clean World Flags Macro", "batches", batches);
	//await foundry.documents.modifyBatch(batches);
}
