//! This whole hook is going to be removed & refactored be part of the new roll Orchestrator
//? Import GreenSock Animation Platform
import gsap, { TextPlugin, Draggable as Dragger } from "/scripts/greensock/esm/all.js";
//? Register Draggable for GreenSock
gsap.registerPlugin(TextPlugin, Dragger);

Hooks.on("renderChatMessageHTML", async (message, html) => {
	const mL = metanthropes.utils.metaLog;

	//* Chat Button Handling
	//? Get the actor from the message - all our messages have the actoruuid flag set, so if it's not our message, return.
	const actorUUID = await message.getFlag("metanthropes", "actoruuid");
	if (!actorUUID) return;
	const actor = await fromUuid(actorUUID);
	if (!actor) return;
	const metaowner = actor.system?.metaowner?.value || null;

	//* Proceed only if the current user is the owner of the actor, or a GM
	if (game.user.name !== metaowner && !game.user.isGM) return;
	// if (game.user.name === metaowner || game.user.isGM) {

	//* Unhide the buttons
	html.querySelectorAll(".hide-button").forEach((btn) => btn.classList.remove("hidden"));

	//* Event listeners
	html.addEventListener("click", async (event) => {
		const button = event.target;
		//? Return if button is not a Metanthropes button element
		if (
			!(
				button.classList.contains("metanthropes-main-chat-button") ||
				button.classList.contains("metanthropes-secondary-chat-button") ||
				button.classList.contains("meta-link")
			)
		) {
			return;
		}

		//* GSAP button animation
		const animateButton = (text) => {
			gsap.to(button, {
				duration: 3,
				text,
				ease: "none",
			});
		};

		//* Buttons we work with
		const approvedButtons = [
			"metaeval-reroll",
			"metainitiative-reroll",
			"metapower-activate",
			"possession-use",
			"hunger-reroll",
			"cover-reroll",
			"roll-damage-reroll",
			"roll-healing-reroll",
			"rolld10-reroll",
			"meta-link",
		];
		const clickedButton = approvedButtons.find((ab) => button.classList.contains(ab));

		//* action based on button class
		switch (clickedButton) {
			case "metaeval-reroll":
				animateButton("Re-Rolling...");
				metanthropes.dice.metaEvaluateReRoll(event);
				break;
			case "metainitiative-reroll":
				animateButton("Re-Rolling Initiative...");
				metanthropes.dice.metaInitiativeReRoll(event);
				break;
			case "metapower-activate":
				animateButton("Activating Metapower...");
				metanthropes.metapowers.metaExecute({ event });
				break;
			case "possession-use":
				animateButton("Using Possession...");
				metanthropes.possessions.metaExecute({ event });
				break;
			case "hunger-reroll":
				animateButton("Re-Rolling Hunger...");
				metanthropes.dice.metaHungerReRoll(event);
				break;
			case "cover-reroll":
				animateButton("Re-Rolling Cover...");
				metanthropes.dice.metaCoverReRoll(event);
				break;
			case "roll-damage-reroll":
				button.classList.add("disabled");
				animateButton("Re-Rolling Damage...");
				metanthropes.dice.metaDamageReRoll(event);
				break;
			case "roll-healing-reroll":
				button.classList.add("disabled");
				animateButton("Re-Rolling Healing...");
				metanthropes.dice.metaHealingReRoll(event);
				break;
			case "rolld10-reroll":
				button.classList.add("disabled");
				animateButton("Re-Rolling...");
				metanthropes.dice.metaRolld10ReRoll(event);
				break;
			case "meta-link":
				//todo review who should be able to open the sheet vs who actually can.
				const doc = await fromUuid(button.dataset.uuid); //? sync instead?
				if (!doc) return mL(2, "renderChatMessageHTML", "metaLink", "No doc from UUID", button.dataset.uuid);
				if (doc?.sheet) return doc.sheet.render(true);
				//? return instead of a break here allows us to skip disabling the other buttons.
				else return mL(1, "renderChatMessageHTML", "metaLink", "Doc doesn't have a sheet", doc);
			default:
				mL(5, "renderChatMessageHTML", "not an actionable event", button, event);
				break;
		}

		//* Disable main buttons
		html.querySelectorAll(".metanthropes-main-chat-button").forEach((btn) => {
			btn.classList.add("disabled");
		});
	});
});
