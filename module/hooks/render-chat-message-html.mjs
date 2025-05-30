//! This whole hook is going to be removed & refactored be part of the new roll Orchestrator
Hooks.on("renderChatMessageHTML", async (message, html) => {
	//* Chat Button Handling
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = await message.getFlag("metanthropes", "actoruuid");
	if (!actorUUID) return;
	const actor = await fromUuid(actorUUID);
	if (!actor) return;
	const metaowner = actor.system?.metaowner?.value || null;
	//* Proceed only if the current user is the owner of the actor, or a GM
	if (game.user.name === metaowner || game.user.isGM) {
		//* Unhide the buttons
		html.querySelectorAll(".hide-button").forEach((btn) => btn.classList.remove("hidden"));
		html.addEventListener("click", (event) => {
			const button = event.target;
			//? Return if button is not a button element
			if (
				!(
					button.classList.contains("metanthropes-main-chat-button") ||
					button.classList.contains("metanthropes-secondary-chat-button")
				)
			) {
				return;
			}
			if (button.classList.contains("metaeval-reroll")) {
				metanthropes.dice.metaEvaluateReRoll(event);
			} else if (button.classList.contains("metainitiative-reroll")) {
				metanthropes.dice.metaInitiativeReRoll(event);
			} else if (button.classList.contains("metapower-activate")) {
				metanthropes.metapowers.metaExecute(event);
			} else if (button.classList.contains("possession-use")) {
				metanthropes.possessions.metaExecute(event);
			} else if (button.classList.contains("hunger-reroll")) {
				metanthropes.dice.metaHungerReRoll(event);
			} else if (button.classList.contains("cover-reroll")) {
				metanthropes.dice.metaCoverReRoll(event);
			} else if (button.classList.contains("roll-damage-reroll")) {
				button.classList.add("disabled");
				metanthropes.dice.metaDamageReRoll(event);
			} else if (button.classList.contains("roll-healing-reroll")) {
				button.classList.add("disabled");
				metanthropes.dice.metaHealingReRoll(event);
			} else if (button.classList.contains("rolld10-reroll")) {
				//? Disable secondary buttons
				button.classList.add("disabled");
				metanthropes.dice.metaRolld10ReRoll(event);
			} else {
				metanthropes.utils.metaLog(5, "renderChatMessageHTML", "not an actionable event", button, event);
			}
			//? Disable main buttons
			html.querySelectorAll(".metanthropes-main-chat-button").forEach((btn) => {
				btn.classList.add("disabled");
			});
		});
	}
});
