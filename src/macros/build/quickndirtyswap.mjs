(async () => {
	// Retrieve all actors from the game using .contents to access the array of actor objects
	let changeActors = game.actors.contents.filter((actor) => actor.name === "Aegis Protagonist");
	console.log(changeActors);

	// Define the updates you want to make to each actor
	let updateData = {
		// Example: Updating the image path for the actor
		"system.Vital.background.value": "test",
	};

	// Update each non-Protagonist actor
	for (let actor of changeActors) {
		try {
			await actor.update(updateData);
			console.log(`Successfully updated actor: ${actor.name}`);
		} catch (err) {
			console.error(`Failed to update actor: ${actor.name}`, err);
		}
	}
})();
