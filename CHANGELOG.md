# Latest Changes

These are the latest changes to the Metanthropes RPG System for Foundry VTT
<br>

<!--
### Legend

##### Each release will include notes in each of the below sections. If omitted, that section did not include any notable changes.

######	Unreleased:	Features that are not yet released to the public
######  Added:	New features to the System
######  Changed:	Changes to existing features
######	Deprecated:	Features that will be removed in future releases
######  Removed:	Features that were removed in this release
######  Fixed:	Fixes to existing issues, including bug fixes
######  Known Issues:	Issues that are known and will be fixed in future releases

-->

## Current: v0.7

### Added:

-   Fully automated Stat, Initiative, Metapower, Possession and Strike Rolls. Right clicking allows the player to set custom options
-   New approach to rolling a new Protagonist. 10 steps designed to guide the player throughout the creation process
-   New tooltips (mouse over to see information) for the majority of the UI elements of the Character sheet
-   New Protagonist Character Sheet sections: Notes & Summary
-   Movement Score is now automatically calculated based on Speed, Weight and Size and is reflected in the grid when you move your character. Green is for normal movement, Yellow for Additional Movement, Orange for Sprint and Red for no more movement. (requires Drag Ruler module)
-   Possessions now may require a Perk to be a certain Level and will add a -10% Penalty to the roll for each Level missing
-   Activations for Metapowers and Possessions that are 'Always Active', now properly prevent you from rolling the dice and display an information message in the client instead
-   When Activating a Metapower and when Using a Possession and a character rolls a Critical Success/Failure and/or when the character doesn't have enough Destiny to spend on rerolls, the Metapower or Possession will auto-activate and the result will be displayed in the chat 
-	A Character's Initiative will now automatically roll with the highest amongst Awareness, Reflexes and Perception, as long as the character has the appropriate Metapower like Danger Sense (6th Sense) and Temporal Awareness (Time Bending)
-   Pain now is automatically calculated, lowering your levels of success and informing you about it in the chat
-   Non-linked Actors are now available to Narrators
-   Introduced Narrator's Toolbox: a set of Narrator-only macros designed to help with the game flow and automate the end of Scene/Session/Arc player awards
-   New Supported module: Carousel Combat Tracker (PR pending)
-   New Supported module: DF Chat Enhancements
-	New Supported module: Monks' Token Bar
-   New Supported module: Streamer View

### Changed:

-   Foundry version 11 is now required
-	Change Log (this page) will from now on follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
-   Revamped the Character sheet to be more intuitive and take less screen 'real estate'
-   Metapowers and Possessions details are now only editable by Narrators
-   Revamped the Items sheets (Metapowers & Possessions) to be more intuitive and take less screen 'real estate'
-   Changed Destiny Reroll button in chat, to now only be visible to the owner of that Character and the Narrator (currently requires module DF Chat Enhancements)
-   Protagonists and Metanthropes are now Actor-Linked to their tokens, all other Actor types are not linked by default
-   New Actors will now have their token default values change once the 'Roll new Actor' 10-step process is completed. The 'Finish Premade Protagonist' button will also trigger similar changes. This controls the visibility of the Name, Life & Destiny Bars and disposition towards other actors: Protagonists are Friendly to each other, Metatherions are Hostile and other actors are Neutral by default.
-   All built-in d20 references have been changed to d10 dice
-   When a character's maximum Life drops (because of Burned condition for example) and their current Life is now greater than their new maximum Life, their current Life will now be set to the new maximum

### Fixed:

-   Fixed a known issue with the Metapower & Possession Sheets not displaying Stat Scores correctly after rolling
- 	Fixed an issue where chat displayed 'null' when using an item with an empty Effect Description
-	Fixed an issue where the Combat Tracker did not display the correct values for the current Cycle and Round
-	Fixed an issue where after changing into a new Cycle and rolling a new initiative, the Combat Tracker did not order the Turn order correctly

### Deprecated:

-   Deprecated the Items and Actors from previous versions. They will still open in v0.7 allowing you to migrate any data you need to the new Actors and Items. These will be removed in v0.8

### Unreleased:

-   Progression of Characteristics and Stats, Metapowers and Perks (scheduled for v0.8)
-   Official support for modules: Terrain Ruler and Enhanced Terrain Layer (scheduled for v0.9)
-   Size Score will now properly buff unarmed strike dice damage (scheduled for v0.9)

## Previous Versions

#### 0.6.00 - 0.6.20

-   New Player Experience: New Character sheet for protagonists with better UI and UX
-   New Player Experience: New Actor Creation workflow with automations and drop-down menus
-   New Player Experience: Left Clicking on a rollable Stat now will automatically roll and apply proper conditions (eg. Penalty from Disease)
-   New Player Experience: Right Clicking on a rollable Stat now will open a dialog with options to add a bonus and a penalty, and a Multi-Action reduction
-   XP System: Starting Perks now are free and don't cost XP
-   Bug Fixing (Critical Failure Roll with Stat>100 had wrong total Levels of Fail calculation)
-   File Naming fixes

#### 0.5.00 - 0.5.37

-   Possessions: Possessions Sheet
-   Possessions: Chat Roll Message Results & Destiny Re-Roll
-   Possessions: Use Chat message depends on the Possession Category & Attack Type & Destiny Re-Rolls for Extras
-   Combat: Initiative Re-Rolls for Destiny, Roll-all-NPCs with a single click
-   Combat: Rolling Initiative with Danger Sense (6th Sense) Metapower equipped rolls with Awareness instead of Reflexes
-   Combat: Rolling for Initiative with 0 Stat correctly now doesn't allow you to roll and puts you on the bottom of the initiative list
-   Combat: Cycles and Rounds and Initiative Re-Rolls as needed
-   Combat: Initiative Ordering (Issue: single sound effect if roll all/npcs & award destiny for double ties and reset initiative & hidden chat messages for hidden-combatants)

#### 0.4.00 - 0.4.20

-   Metapowers: Activation & Effects on Chat & Re-Roll Extras
-   Combat: Metanthropes RPG Basic Initiative Rules

#### 0.3.00 - 0.3.16

-   Custom Bars for Destiny & Life
-   Metapowers: Metapower Sheet (Known Issue)
-   Characteristics & Stats: Dropping to 0 or lower triggers a Notification in the UI and disables any kind of rolls with that Stat
-   UI Customization

#### 0.2.00 - 0.2.64

-   Protagonist Sheet
-   Perks: Sheet
-   XP System: Progressed Characteristics and Stats (Known Issue)
-   XP System: Perk Progression Automated XP Spending
-   Metapowers: Metapower Activation

#### 0.0.102 - 0.1.99

-   Levels of Success & Failure and Stat Roll automated checks
-   Critical Success & Failure and automatic Destiny awarding
-   Multi-Actions, Automated Destiny Re-Rolls, and Bonus & Penalties in Rolls
-   Life Max value auto calculation
-   Movement value now determines the additional & sprint movement automatically and updates Drag Ruler mod to correctly display movement distances in the canvas
-   Initiative Roll and Combat System basics
-   Improved Foundry UI customization and more functional Actor and Item sheets

#### 0.0.01 - 0.0.102

-   Initial Metanthropes System configuration, settings and Rules integration with Foundry VTT
-   Metanthropes RPG Characteristics & Stats, Buffs and Conditions & auto-calculations
-   Actor and Item sheets and minimal branding
-   Based off the Boilerplate System for Foundry VTT v.10 from Asacolips

Our eternal gratitude goes to the amazing community of Foundry Developers <3
