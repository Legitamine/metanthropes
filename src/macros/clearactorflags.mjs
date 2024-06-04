// Define the function to clear flags on an actor
async function clearFlagsOnActor(actor) {
	await actor.update({'flags.-=metanthropes':null});
	//await actor.update({'flags.-=scene-packer':null});
	console.log(`Cleared flags for actor: ${actor.name}`);
}

// Main function to clear flags for all actors in the World
async function clearAllActorFlags() {
	// Retrieve all actors in the world
	const allActors = game.actors.contents;

	// Iterate over all actors and clear flags
	for (let actor of allActors) {
		await clearFlagsOnActor(actor);
	}

	console.log("All actors' flags cleared except for flags.core");
}

// Run the main function
clearAllActorFlags();
