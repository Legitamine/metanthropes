Roll Orchestrator design notes: https://github.com/Legitamine/metanthropes/issues/320
Chat Orchestrator design notes: https://github.com/Legitamine/metanthropes/issues/3


# Responsibilities
- controls the flow of information from the moment the narrator calls for a roll/ player initiates a roll
- until resolution, where it will post/update the chat log
- aware of previous/required multiactions throughout a players' turn

## Notes
- besides narrator/player, other players might be able to do some kind of reaction/interfere with the roll at certain stages
- roll orchestrator will be responsible for triggering and closing that ui/ux interaction with other playe

# goals
- ability to be triggered via a Narrator's call for roll
- utilize sockets to ensure the correct flow of information and actions
- flexible api to enable efficient macros
- custom enricher support for journals

# Flow of steps

1. Ownership 
	- define if I am rolling for my own character or mind controlling someone and rolling with different stat pool or have access to abilities
	- stats and details (meta cognition, D.E, Density)
	- Probed / Infiltrated
	- lack of lore -10% penalty per level

2. Eligibility
	- unlocked that level of mp
	- destiny requirements
	- eligible targets (type, detection, range, area effect, senses lost)
	- fatigue, action slot unavailable, spent slots
	- under the effects of weakn/negate/augment
	- is it an upgraded mastery version?

3. Chance of fail
	- hunger
	- cover (reactions allowed before deciding this)

4. On your Next d100 Roll
	- bonus /penalty from ^
	- added or removed success or fails (targets' next roll)
	- pain
	- fixed outcomes
	- 'advantage'

5. Bonus & Penalties
	- reductions + increases
	- Multiaction (up to stat), lack of skill, aiming (reduction)
	- Disease
	- is my stat used above 1%?
	- Do I use a different stat like manipulation with mirror metapower?

6. Make the roll
	- we should now have all the information (and results from reactions here or in 8? are there any reactions prior to us rolling? evade?) before we roll our dice
	- meaning we can inform the player before they take an action (choice of what to do/roll for) with tooltip/on screen information
	- make the roll
	- show player the outcome and choices
		- spend destiny choice goes for reroll
		- show accumulated +/-
		- crit does not allow any further choices
			- gain destiny + resulting action triggers

7. Aware
	- Who is aware of the roll/action being made?
		- Aware from Metapower like Luck, Order< Meta Cognition
		- Detect Metapower/Possesion Activations
		- Lore to understand level and details (lore alone is not aware)
	- is it something that would trigger VFX as part of activating something?
		- strikes/attacks/evades

8. Reactions
	- activation vfx linger while this takes place and we go to step 11
	- who can react to this (they need to have been made aware above first)
	- go check steps 2-6 for each possible reaction
	- reaction in reaction? (step 7)
	- conclusions to reactions

9. Spending
	- spend levels of success
	- upgrades rolls, damage, durations, immunities, resistances
	- spending removes accumulated, changes outcome
	- what if spending increases range / targets
	- what if spending changes eligibility?

10. Conclusion to Roll
	- Show actual results
	- roll subsequent rolls, d10 damage, durations etc
	- changes to explosive d10
	- rolls for location if not aiming?

11. Conclusion
	- confirm (auto confirm?) = send to saga log
	- apply damage/healing
	- active effects
	- trigger sound/visuals of the execution of the action
	- roleplay description only to chat unless Lore, etc

12. Achievements
	- update high scores etc
	- store flags on the actor if needed?


# side notes
journal extender for Homebrew: say I check what does Lore II give me, and the Narrator has added/changed the description to fit their setting better. Same for other journal-provided text (arc/regression/metamorphosis etc).
