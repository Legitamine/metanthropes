![image](https://content.invisioncic.com/e290497/monthly_2022_12/01.jpg.10f501a62b5254cef6f04d9f87c8b52d.jpg)
![Repository License](https://img.shields.io/github/license/legitamine/metanthropes-system)
![Foundry v10](https://img.shields.io/badge/foundry-v10-green)

# Metanthropes RPG System for FoundryVTT
This is the official Metanthropes RPG system for Foundry VTT.

- This project is in no way affiliated with or supported by Foundry VTT.
- For more information about Metanthropes RPG visit https://metanthropes.com

## Installation
This is a work in progress and is not ready for general use. Installation instructions will be placed here when the system is ready. Please do not use this system for your games, unless you want to help playtest and know what you're doing. If so, please join us on our Discord server: https://metanthropes.com/discord

## Supported Modules
This System aims to utilize the latest and best in Foundry VTT. Currently offers support for the latest stable Foundry VTT version 10.291

To get the best experience while playing Metanthropes RPG, we recommend to install the following fully supported modules:

- Dice So Nice: https://foundryvtt.com/packages/dice-so-nice
- Drag Ruler: https://foundryvtt.com/packages/drag-ruler
- Moulinette: https://foundryvtt.com/packages/moulinette-core (you have to manually run the Index command for Sound and Image assets in your world)
### Known Issues
- Automatic XP Calculation for Characteristics and Stats assumes that you progressed your Characteristic first, otherwise it will spent more XP than what it should. 
	- Workaround: Use the Spent XP manual input field to adjust the XP spent for the Stat.
- Metapowers tab in your Character Sheet displays the Current value of the Stat for that Metapower's Activation. If any Stat is changed, or a Roll is made, the values in the Metapowers Tab become null.
	- Workaround: Close your Character Sheet and re-open, the correct values will be displayed.
- Combat: Hidden Combatants are not rolling hidden Initiative correctly.
	- Workaround: The Narrator should manually ensure their rolls are hidden before rolling for Initiative.
### Planned Features
You may read about our planned features and milestones over at https://github.com/Legitamine/metanthropes-system/milestones
Briefly, we are working on the following features:
- Officially Support the full Ruleset for Metanthropes RPG
- Synchronize your Protagonist details with the website for off-line viewing and editing
- GitHub Issues Integration with the Metanthropes Roadmap
- Integration with 3rd party modules to automate the Metapower Activation and Possession Usage with visual and audio effects.
### Latest Changes
These are the latest changes for the Official Metanthropes RPG System for Foundry VTT
#### 0.6.00 - current build (status)
- XP System: Metapowers (pending)
- New Player Experience
#### 0.5.00 - 0.5.37
- Possessions: Possessions Sheet
- Possessions: Chat Roll Message Results & Destiny Re-Roll
- Possessions: Use Chat message depends on the Possession Category & Attack Type & Destiny Re-Rolls for Extras
- Combat: Initiative Re-Rolls for Destiny, Roll-all-NPCs with a single click
- Combat: Rolling Initiative with Danger Sense (6th Sense) Metapower equipped rolls with Awareness instead of Reflexes
- Combat: Rolling for Initiative with 0 Stat correctly now doesn't allow you to roll and puts you on the bottom of the initiative list
- Combat: Cycles and Rounds and Initiative Re-Rolls as needed
- Combat: Initiative Ordering (Issue: single sound effect if roll all/npcs & award destiny for double ties and reset initiative & hidden chat messages for hidden-combatants)
#### 0.4.00 - 0.4.20
- Metapowers: Activation & Effects on Chat & Re-Roll Extras
- Combat: Metanthropes RPG Basic Initiative Rules
#### 0.3.00 - 0.3.16
- Custom Bars for Destiny & Life
- Metapowers: Metapower Sheet (Known Issue)
- Characteristics & Stats: Dropping to 0 or lower triggers a Notification in the UI and disables any kind of rolls with that Stat
- UI Customization
#### 0.2.00 - 0.2.64
- Protagonist Sheet
- Perks: Sheet
- XP System: Progressed Characteristics and Stats (Known Issue)
- XP System: Perk Progression Automated XP Spending
- Metapowers: Metapower Activation
#### 0.0.102 - 0.1.99
- Levels of Success & Failure and Stat Roll automated checks
- Critical Success & Failure and automatic Destiny awarding
- Multi-Actions, Automated Destiny Re-Rolls, and Bonus & Penalties in Rolls
- Life Max value auto calculation
- Movement value now determines the additional & sprint movement automatically and updates Drag Ruler mod to correctly display movement distances in the canvas
- Initiative Roll and Combat System basics
- Improved Foundry UI customization and more functional Actor and Item sheets
#### 0.0.01 - 0.0.102
- Initial Metanthropes System configuration, settings and Rules integration with Foundry VTT
- Metanthropes RPG Characteristics & Stats, Buffs and Conditions & auto-calculations
- Actor and Item sheets and minimal branding
- Based off the Boilerplate System for Foundry VTT v.10 from Asacolips 

Our eternal gratitude goes to the amazing community of Foundry Developers <3