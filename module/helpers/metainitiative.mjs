// Import the MetaRollStat function
import { MetaRollStat } from "./metarollstat.mjs";

// MetaInitiative function handles Initiative rolls
export async function MetaInitiative(actor) {
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const reflexesValue = actor.system.RollStats[reflexesStat];
	const awarenessValue = actor.system.RollStats[awarenessStat];
	let initiativeStat = reflexesStat;
	let statValue = reflexesValue;

	// Check if the actor has the metapower "Danger Sense"
	const hasDangerSense = actor.itemTypes.metapower.some((metapower) => metapower.name === "Danger Sense");

	// If the actor has "Danger Sense", use Awareness for Initiative
	if (hasDangerSense) {
		initiativeStat = awarenessStat;
		statValue = awarenessValue;
	}

	// Call MetaRollStat function with the appropriate stat (Reflexes or Awareness)
	await MetaRollStat(actor, initiativeStat, statValue);

	// Retrieve the initiative data from the actor's flags
	const initiativeData = actor.getFlag("metanthropes-system", "lastrolled");

	// Extract the values you need
	const levelsOfSuccess = initiativeData.levelsOfSuccess;
	const levelsOfFailure = initiativeData.levelsOfFailure;
	const resultlevel = initiativeData.resultlevel;
	const result = initiativeData.result;
	// Use these values as needed for your MetaInitiative function
	// I will take these values and store them inside an initiative flag on the actor
	await actor.setFlag("metanthropes-system", "initiative", {
		levelsOfSuccess: levelsOfSuccess,
		levelsOfFailure: levelsOfFailure,
		resultlevel: resultlevel,
		result: result,
	});
}
