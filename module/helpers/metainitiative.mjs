// Import the MetaRollStat function
import { MetaRollStat } from "./metarollstat.mjs";

// MetaInitiative function handles Initiative rolls
export async function MetaInitiative(combatant) {
	const actor = combatant.actor;
	console.log("Metanthropes RPG MetaInitiative called for actor: ", actor.name);
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const reflexesValue = actor.system.RollStats[reflexesStat];
	const awarenessValue = actor.system.RollStats[awarenessStat];
	let initiativeStat = reflexesStat;
	let statValue = reflexesValue;
	let initiativeValue = null;

	// Check if the actor has the metapower "Danger Sense"
	const hasDangerSense = actor.itemTypes.metapower.some((metapower) => metapower.name === "Danger Sense");

	// If the actor has "Danger Sense", use Awareness for Initiative
	if (hasDangerSense) {
		initiativeStat = awarenessStat;
		statValue = awarenessValue;
	}

	// Call MetaRollStat function with the appropriate stat (Reflexes or Awareness)
	console.log("MetaInitiative calls MetaRollStat for: ", actor, initiativeStat, statValue);
	await MetaRollStat(actor, initiativeStat, statValue);
	console.log("MetaInitiative returned from MetaRollStat for: ", actor, initiativeStat, statValue);

	// Retrieve the last rolled data from the actor's flags
	const initiativeData = actor.getFlag("metanthropes-system", "lastrolled");
	// Extract the values you need
	const levelsOfSuccess = initiativeData.levelsOfSuccess;
	const levelsOfFailure = initiativeData.levelsOfFailure;
	const resultLevel = initiativeData.resultLevel;
	if (resultLevel > 0.4) {
		initiativeValue = Math.max(levelsOfSuccess, resultLevel);
	} else {
		initiativeValue = -Math.max(levelsOfFailure, resultLevel);
	}
	// Use these values as needed for your MetaInitiative function
	// I will take these values and store them inside an initiative flag on the actor
	await actor.setFlag("metanthropes-system", "initiative", {
		initiativeValue: initiativeValue,
	});
}
