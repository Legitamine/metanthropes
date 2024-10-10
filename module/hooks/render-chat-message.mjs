Hooks.on("renderChatMessage", async (message, html) => {
	//* Chat Button Handling
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = await message.getFlag("metanthropes", "actoruuid");
	if (!actorUUID) return;
	const actor = await fromUuid(actorUUID);
	if (!actor) return;
	const metaowner = actor.system?.metaowner?.value || null;
	//? Proceed only if the current user is the owner of the actor, or a GM
	if (game.user.name === metaowner || game.user.isGM) {
		//? Unhide the buttons
		html.find(".hide-button").removeClass("hidden");

		//? Handle Main Chat Buttons (all the buttons that will be disabled if any of them is clicked)
		html.on("click", ".metanthropes-main-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("metaeval-reroll")) {
				metanthropes.dice.metaEvaluateReRoll(event);
			} else if (button.hasClass("metainitiative-reroll")) {
				metanthropes.dice.metaInitiativeReRoll(event);
			} else if (button.hasClass("metapower-activate")) {
				metanthropes.metapowers.metaExecute(event);
			} else if (button.hasClass("possession-use")) {
				metanthropes.possessions.metaExecute(event);
			} else if (button.hasClass("hunger-reroll")) {
				metanthropes.dice.metaHungerReRoll(event);
			} else if (button.hasClass("cover-reroll")) {
				metanthropes.dice.metaCoverReRoll(event);
			}
			//? Disable all main chat buttons
			html.find(".metanthropes-main-chat-button").prop("disabled", true);
		});

		//? Handle secondary chat buttons (all the buttons that will disable only themselves when clicked)
		html.on("click", ".metanthropes-secondary-chat-button", function (event) {
			const button = $(event.currentTarget);
			if (button.hasClass("rolld10-reroll")) {
				metanthropes.dice.metaRolld10ReRoll(event);
			}
			//? Disable only the clicked secondary chat button
			button.prop("disabled", true);
		});
	}
});