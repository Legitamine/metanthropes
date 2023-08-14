export async function MetaExecute(actorUUID, action, itemName, event = null) {
	//todo: utilize existing levels of success and spent levels of success
	//? If we called this from a button click, get the data we need
	if (event) {
		const button = event.target;
		actorUUID = button.dataset.actoruuid;
		itemName = button.dataset.itemName;
	}
	const actor = await fromUuid(actorUUID);
	//? Checking if actor has Metapowers that affect the explosive dice
	let explosiveDice = "x10";
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasArbiterPowers = metapowers.some((metapower) => metapower.name === "Arbiter Powers");
	if (hasArbiterPowers) {
		explosiveDice = "x1x2x10";
	}
	//? Main Execution
	if (action === "Metapower") {
		//
	}
	else if (action === "Possession") {
	}
	//? Find the first item that matches the name
	const MetaItemData = metapowers.find((metapower) => metapower.name === itemName);
	if (!MetaItemData) {
		console.log("Metanthropes RPG System | MetaExecute | Could not find MetaItemData for ", itemName);
		return;
	}
	console.log("Metanthropes RPG System | MetaExecute | MetaItemData:", MetaItemData);
	//! edw einai to trick gia to merger - prepei ola ta properties na einai kai sta 2
	const effect = MetaItemData.system.EffectDescription.value;
	const targets = MetaItemData.system.Activation.Targets.value;
	const targetsdice = MetaItemData.system.Activation.TargetsDice.value;
	const duration = MetaItemData.system.Activation.Duration.value;
	const durationdice = MetaItemData.system.Activation.DurationDice.value;
	const damage = MetaItemData.system.Effects.Damage.value;
	const healing = MetaItemData.system.Effects.Healing.value;
	const buffs = MetaItemData.system.Effects.Buffs.value;
	const conditions = MetaItemData.system.Effects.Conditions.value;
	//! need a new field to track fixed numbers to be added to the roll results
	//! do I need multiples based on different damage types?
	//todo na skeftw tin xrisi twn flags kai pws ta diavazw - ti xreiazomai pragmatika?
	//todo mazi me ta activations (lvls) na skeftw kai ta usage (lvls antistoixa)
	//todo episis upcoming combos!
	//todo kai olo mazi na kanei seamless integration se ena executioN!
	// Create a chat message with the provided content
	let flavorData = null;
	let contentData = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	//console.log("MetaExecute - result:", result);
	if (result.Metapower <= 0) {
		flavorData = `Fails to Activate ${itemName}!`;
	} else {
		flavorData = `Activates ${itemName} with the following:`;
		contentData = `<div>Effect:${effect}</div><br>`;
		if (targetsdice) {
			contentData += `<div class="hide-button hidden">🎯 Targets:
		<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsdice}" data-what="🎯 Targets" data-targets="${targets}" data-destiny-re-roll="true">
		🎯 [[${targetsdice}d10${explosiveDice}]] ${targets} 🤞</button>
		</div><br>`;
		} else {
			contentData += `<div>🎯 Targets: ${targets}</div><br>`;
		}
		if (durationdice) {
			contentData += `<div class="hide-button hidden">⏳ Duration:
		<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationdice}" data-what="⏳ Duration" data-duration="${duration}" data-destiny-re-roll="true">
		⏳ [[${durationdice}d10${explosiveDice}]] ${duration} 🤞</button>
		</div><br>`;
		} else {
			contentData += `<div>⏳ Duration:${duration}</div><br>`;
		}
		if (damage) {
			contentData += `<div class="hide-button hidden">💥 Damage:
		<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
		💥 [[${damage}d10${explosiveDice}]] 🤞</button>
		</div><br>`;
		}
		if (healing) {
			contentData += `<div class="hide-button hidden">💞 Healing:
		<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healing}" data-destiny-re-roll="true">
		💞 [[${healing}d10${explosiveDice}]] 🤞</button>
		</div><br>`;
		}
		if (buffs) {
			contentData += `<div>🛡️ Buffs:${buffs}</div><br>`;
		}
		if (conditions) {
			contentData += `<div>💀 Conditions:${conditions}</div><br>`;
		}
	}
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: flavorData,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentData,
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
	//? Refresh the actor sheet if it's open
	const sheet = actor.sheet;
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
}
