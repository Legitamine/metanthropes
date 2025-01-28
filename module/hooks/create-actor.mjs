Hooks.on("createActor", async (actor) => {
	//* Duplicate Self Metapower Activation Detection - Rename to Duplicate & Remove Items & Effects from Duplicates
	if (actor.name.includes("Copy") && actor.isDuplicatingSelf) {
		const newName = actor.name.replace("Copy", "Duplicate");
		await actor.update({
			name: newName,
			"prototypeToken.name": newName,
			"prototypeToken.actorLink": false,
			"prototypeToken.appendNumber": true,
			"prototypeToken.prependAdjective": false,
		});
		const itemsToDelete = actor.items.filter((item) => item.name !== "Strike");
		await actor.deleteEmbeddedDocuments(
			"Item",
			itemsToDelete.map((item) => item.id)
		);
		metanthropes.utils.metaLog(3, "createActor Hook", "Removed Items from Duplicate", actor.name);
		const effectsToDelete = actor.effects.filter((effect) => effect.label !== "Duplicate");
		await actor.deleteEmbeddedDocuments(
			"ActiveEffect",
			effectsToDelete.map((effect) => effect.id)
		);
		metanthropes.utils.metaLog(3, "createActor Hook", "Removed Effects from Duplicate", actor.name);
	}
});