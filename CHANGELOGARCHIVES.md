# Changelog Archives

Welcome Lorekeepers, Technomancers and fellow Orchestrators! 

Here you can find the changelogs from the initial version of the Metanthropes System, up until version 1.0. Changelogs from version 1.0 and onwards can be found in the main [CHANGELOG.md](https://github.com/legitamine/metanthropes/blob/main/changelog.md) file.

- Version 0.7.85 brought the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format to the Changelog.
- Previous Versions had a more free-form style, yet you can find them further below, kept for posterity and perhaps some nostalgia.

# Why not just delete older changelogs?

For posterity and perhaps some nostalgia. Also, it's a good reminder of how far we've come!

# Early Access v0.10.145 [2024-07-27]

## Added:

-   Initial support for the [Tokenizer Module](https://foundryvtt.com/packages/vtta-tokenizer/). If Tokenizer is enabled, it will replace the default Actor image change process and UI.

## Changed:

-   Removed a test message that showed in Chat when Beta Testing of New Features was enabled and the Actor targeted a Token, while Activating a Metapower, or Using a Possession.

## Known Issues:

-   Metanthropes: Core new 100 Metapowers Journal, takes a few seconds to open the page when you click on one of the 10 Classifications. While it will load after a few seconds, it might give the impression that the page is empty, as there is no progress bar visible while the information loads. We will address the performance of this Journal in the near future.

# Early Access v0.10.142 [2024-07-26]

## Added:

-   Metanthropes: Core now comes with a new Compendium that includes all the 100 Metapowers of the game, for a total of more than 500 unique abilities. The Compendium is available for Narrators to use in order to add Metapowers to Actors; Players can see the Compendium but can't add Metapowers to Actors directly from it.
-   Metanthropes: Core now comes with an API to allow other Modules and the Metanthropes System to interact with the new functionality that is enabled by this Module. The API is in early development and will be further expanded in future builds.

## Changed:

-   Changed Primary & Secondary Token attribute definition, to improve 3rd Party Module support.

## Fixed:

-   Metanthropes: Core will now apply the correct default Actor Portrait and Token image to new Actors, based on their type, unless that actor is created from the Duplicate Self Metapower Activation, in which case, the Duplicate Actors will keep the original Actor's Portrait and Token image.
-   Metanthropes: Core will now correctly give the 'Strike' Possession to new Humanoid Actors, when they are created, as intended.
-   Metanthropes: Introductory will now correctly import the Phytomorphic Antagonist as a 3x3 scale Token when placed on the grid, as intended.
-   Various fixes for Action Scenes and the tracking of effects during Combat.

# Early Access v0.9.744 [2024-06-22]

## Added:

-   Metanthropes: Introductory has 4 new Actor Portraits (& accompanying Top-down Token Images) for the Protagonists & Humans.
-   Metanthropes: Core now comes with an additional Journal that helps navigate new players to create their Protagonists.
-   Metanthropes: Core now has 7 new Rollable tables to help with creating new Actors. Integration & automations with the Roll new Actor process are planned for later builds.
-   Metanthropes: Homebrew now enables you to define a custom ruleset name, which is displayed in Chat when a Homebrew rule applies.
-   Metanthropes: Homebrew has a new setting to change the Life loss per Bleeding Condition level.

## Changed:

-   Metanthropes: Core when rolling for a new Actor, you can now set a base value for starting Destiny, besides a number of dice. The default has changed from 3d10 to 8 + 2d10, giving a more consistent starting Destiny (minimum 10 Destiny points) when creating new Actors.
-   Metanthropes: Core will now skip changing the Actor's portrait during the Roll New Actor process. A new process that will include selecting the Actor's portrait will come in later builds with the new UI.
-   When applying End of Round effects during Combat, now a single Chat message informs of all affected combatants during the end of round message, instead of each individual Actor & Condition, minimizing the number of new chat messages to one.
-   The Combat Tracker no longer displays the current Cycle, instead, the current Cycle is displayed in the Chat message at the start of every Round.
-   Changed the Combat Chat message to be from 'Metanthropes Action Scene' instead of 'Metanthropes Combat'.

## Fixed:

-   Properly fixed the Combat issues mentioned in the previous builds.

## Known Issue:

-   During an Action Scene, when asked to roll for initiative, if an Actor moves it will cause to re-apply the end-of-round effects. This will be addressed when we implement the Movement restrictions during combat, that will come in a later build.

# Early Access v0.9.637 [2024-06-12]

## Fixed:

-   Hotfixed an issue that caused Combat to break when more than 2 Combatants with Core Conditions triggered the end of Round effect application. This is a temporary solution and will be addressed properly in the next release. Causes the Cycle counter to not update properly.

## Known Issues:

-   Combat Cycles won't update properly and display 'Cycles 1' in Chat & Combat Tracker.

# Early Access v0.9.635 [2024-06-08]

## Added:

-   Metanthropes: Introductory Module now comes with new artwork for the various Actors. Each Actor comes with a distinct Portrait & top-down Token Image.
-   Metanthropes: Introductory Journals have been updated with handy links to macros to help with the flow during a session. This is ongoing process and Journals, Macros and various effects will be improved throughout Early Access. Give us your feedback on what you'd like to see added to help with the flow of the session.
-   Metanthropes: Introductory has improved the lighting of The Opera Scene, depending on the story progression. We won't spend too much effort here, until v12 support comes along, and that will bring the capability to apply our envisioned special effects, but this crude approximation will do for this stage of Early Access development and v11 capabilities.
-   Metanthropes: Core has a few more Possessions and Metapowers.
-   Metanthropes: Homebrew now comes with Targeting v1, by enabling the 'Beta Testing of New Features' option in the Settings. Once enabled, when an Actor has targeted any Tokens, they will be mentioned within the Chat message on Metapower & Possession Activations/Uses.

## Changed:

-   Metanthropes: Introductory updated all the included Actors with proper Stats, Perks, Possessions and Metapowers.
-   Metanthropes: Introductory 'End of Scene' Macro has been updated to show only the non-premade Protagonists in the World, in order to assign them Destiny points.
-   Re-introduced a way to change an Actor's portrait image, by clicking on the Actor Portrait Image within the Summary Tab. The selection will open at a folder that's configured as the default for that particular actor type. Once an image is selected, the respective top-down Token image will be applied to that Actor's Tokens throughout scenes. This is still WIP - check the known issues.
-   The 'Finalize Premade Actor' button on the Summary Tab now checks if the user is a Narrator (Gamemaster) and displays a warning, as Narrators should not do this themselves. Instead, Narrators should use the 'Assign Player' button to give the Actor to a Player and have the Player click on the 'Finalize Premade Actor' instead.
-   The customized file picker window for selecting Actor Images has changed the default layout for the new image dimensions.
-   Updated the metaExecute() function to also do the Targeting and Damage/Healing activation. This functionality is in a proof-of-concept stage currenlty and only available for Beta Testing via the Homebrew Module.
-   Changed the default resource bars to have Life in bar 1 and Destiny in bar 2.

## Fixed:

-   Fixed a known issue for Metanthropes: Introductory; Scenes now display the correct thumbnail after importing from the adventure compendium. Scenes now also open at a specific position relative to the map dimensions by default.
-   When Combat ends during the first Round of the first Cycle, it will now display the appropriate message in Chat. Made the chat message start at a new line for the results, making it more clear to notice.
-   Various minor fixes & optimization for the Finalize Premade actor process.
-   Cleaned up the majority of the change Actor Image process code, we are not releasing the Token Image process update as a separate capability at this time, let us know if more control over Token image with ex. wildcard support is desired.
-   Refactored some of the old Combat code that controls how effects are applied at the end of Round, and how Cycles are calculated and reported via Chat. Fixed an issue when rolling for Initiative and the new Turn order will now be set correctly once everyone rolls for Initiative.

## Known Issues:

-   In order for a Player to be able to select a new Portrait image, they have to be given the 'Use File Browser' permission or the 'Trusted Player' user role.
-   Rolling for Initiative, will not automatically exclude Dead tokens, it will however bypass them in the Turn order, if the 'Skip Defeated' option in enabled in the Combat Tracker Settings.

# Early Access v0.9.592 [2024-05-27]

## Changed:

-   Changed the Chat message to display the results in a more clear manner, having the final result start in a new line and removed the '\*' that followed the number for Success/Failure and Destiny.
-   Metanthropes: Introductory Module has updated Journals with a few minor fixes & typos and updated the Premade Protagonists with the correct Backgrounds, Narrator Notes and Possessions.

## Fixed:

-   Fixed an issue that was causing NaN error to appear when entering null values in the custom roll options for Bonus, Penalty and Reduction.

## Known Issues:

-   Metanthropes: Introductory imported scenes do not have the correct thumbnail and instead seem to be empty. To fix, right-click on the Scene and select 'Generate Thumbnail Image'.

# Early Access v0.9.589 [2024-05-26]

## Added:

-   Initial testing for Foundry V12 started. The System will allow running in V12, however, we do not officially support V12 for running games and is only for testing purposes. V12 will bring a plethora of much wanted features such as Scene Regions that we plan to utilize fully for Metapower activations, so more features that utilize and require V12 will be coming soon.

## Changed:

-   The 'Assign Player' button in the Actor Character Sheet, Summary Tab, now does not require a Player to be active (connected to the game) in order to be assigned an Actor.
-   The logic behind the 'Finalize Premade Actor' button on the Actor Summary Tab, is no longer tied to the 'Assign Player' logic. Narrators should use the 'Assign Player' button and Players can then use the 'Finalize Actor' button.
-   Changed the tooltip text on the Create Actor and Create Item / Compendium buttons, to better clarify that during Early Access, these features are available for testing in the Core and Homebrew modules respectively.
-   Re-enabled the creation of Journals & Playlists.

## Known Issues:

-   You are not currently able to change the Actor's Portrait Image via tha Character Sheet, this functionality will be re-enabled when we introduce the new Portrait Images that will come with the Metanthropes: Introductory Module.

---

# Early Access v0.9.587 [2024-05-21]

## Added:

-   Initial Support for all Metanthropes Premium Modules. Their versions will now follow the build version of Metanthropes System for which they will from on also depend upon & require, in order to install & update.
-   Metanthropes: Introductory added a new Installation Guide, Early Access content included, however it is still missing many of the original artwork planned to be available later during the Summer of 2024.
-   Metanthropes: Core added a new Installation Guide, initial content added, mainly for testing purposes.
-   Metanthropes: Homebrew added a new Installation Guide and barebone content, mainly for testing purposes

## Changed:

-   Final pass for the Compendium restructuring, for both the System and all the Premium Modules. This new structure will now become the foundation for content that will added to the game as we progress through the Early Access milestones.

# Early Access v0.9.552 [2024-05-20]

## Changed:

-   Second pass of re-structuring the Compendiums is complete, now you will see a 'Metanthropes' Folder in the Compendiums Tab and all our content will be from now on placed within this structure, to reduce clutter and improve usability.

## Fixed:

-   Fixed an issue that was causing the Installation Guide journal that was introduced in the previous build to not work as intended.

# Early Access v0.9.524 [2024-05-18]

## Added:

-   Initial support for [Metanthropes: Introductory - Early Access](https://www.metanthropes.com/store/product/6-introductory-early-access/)
-   Special popup for Narrators (Gamemasters) when the World loads for the very first time, to help them install the Demo Content that comes with the System. This will only show once but can also be accessed via the Compendiums tab or re-enabled from the Settings.
-   Added a Setting to control if the World is automatically un-paused after loading. This setting is enabled by default.
-   Included the Humanoid Hit Location Rollable Table as a Compendium. This Rollable Table will be used automatically in later builds by the Combat system and can also be used manually by Narrators & Players.

## Changed:

-   Updated the Welcome page that shows up when the World loads. You can control it from the Settings.
-   Changed the UI for the Actor Summary tab to accommodate the upcoming Portait and Token image changes.
-   First pass of re-structuring the Compendiums, this is a work in process to be completed in later builds.

## Fixes:

-   Various minor Actor Sheet UI fixes and optimizations

# Early Access v0.9.189 [2024-03-22]

## Changed:

-   Removed references in the Welcome Screen for the Introductory Zine Kickstarter.

## Fixed:

-   Fixed the Create Compendium Button that was changed in the previous release.
-   Fixed the Pyrokinesis Example Build Actor to not have any negative Condition Levels.

# Early Access v0.9.183 [2024-03-05]

## Changed:

-   The Sidebar buttons to Create Actors, Scenes, Journals, Rolltables and Compendiums are now unhidden and a tooltip exists to highlight that this functionality requires the Metanthropes Core Module.
-   The Sidebar button to Create Items is now unhidden and a tooltip exists to highlight that this functionality requires the Metanthropes Homebrew Module.

## Fixed:

-   The Sidebar buttons that appear when creating subfolders, now properly follow the same behavior as the main Sidebar button behavior, showing a tooltip with the required Metanthropes Module to enable this functionality.

# Early Access v0.9.176 [2024-03-05]

## Changed:

-   Improved the Sheet UI with some changes to the fonts and overall layout for more clarity.
-   Improved the Welcome Screen layout.

# Early Access v0.9.157 [2024-03-03]

## Added:

-   Added more information on the tooltips for Rolls that informs you if the Roll Result will be affected by Disease, Pain or Hunger Conditions. This new functionality is not included in the Item Sheet at this time.

## Changed:

-   The Welcome Journal will now be included and imported when using the built-in Demo adventure to populate a new World.
-   The resulting effect of a Roll, will now be displayed with Bold text in Chat for better clarity.
-   Permanent Buffs gained by Metapowers & Possessions will now not show up in the Chat message, however they are still visible in the respective Item Sheet.

## Fixed:

-   Finaly fixed a long-standing known issue, where the Stat Scores shown in the Metapowers & Possessions tabs would not update properly.

# Early Access v0.9.143 [2024-03-01]

## Added:

-   Added a new Welcome Screen with some basic guidance on how to use our first Early Acccess Demo.
-   Added a Demo Adventure Type Compendium that includes 4 Actors and a Sample Scene.
-   Added initial support for installing & running the System on The Forge.

## Changed:

-   Improved some of the graphics & typography for the Character & Item Sheets, Buttons and Chat. All design elements are subject to change throughout Early Access, as we come closer to finalizing the UI & UX.
-   Cleaned up and improved the code documentation for the Early Access release. This is an on-going task with changes that won't affect the gameplay in any way, but will help other developers (and myself) when reviewing and making further changes to the code.

## Fixed:

-   Multi-Actions are now available only for Metapowers & Possessions with 'Main Action' as their activation cost & for Stat Rolls and won't be available with other types of rolls.
-   Resizing the Actor sheet via the header buttons will not change the active tab anymore, to avoid confusion
-   Various Minor Fixes in the UI & UX.

---

### Closed Beta Releases

---

# Closed Beta v0.9.025 [2024-01-13]

## New Features:

-   Sound Effects for Items: A new section is available for Metapowers / Possessions under Item / Effects Tab (editable if you have the Homebrew Module) that allows you to define a SFX Compendium and a SFX Name to play an Audio File when activating/using this Item. This section is not visible to Players, only Narrators.

## Changed:

-   Changed the UI to not allow changes to the Progression of Actors, unless the 'metanthropes-core' Module is enabled.

# Closed Beta v0.9.013 [2023-12-22]

## Breaking Changes:

-   Renamed the id of the system to 'metanthropes'. This is a breaking change that will require worlds to adjust to the new id.
-   Moved content to the Metanthropes Introductory Module. This is a breaking change that will require worlds to adjust to the new module.
-   Moved the ability to create your own Actors, Scenes, Journals, Rollable Tables and Compendiums to the new 'metanthropes-core' module, as part of our Early Access release plan.
-   Moved the ability to create your own Items as well as the 'Beta Testing of New Features' to the new 'metanthropes-homebrew' module, as part of our Early Access release plan.

# Closed Beta v0.8.150 [2023-12-17]

## New Features:

-   Active Effects now automatically become Inactive, when their Duration is over, during Combat. The Effect will move from the 'Active Effects' to the 'Inactive Effects' category, so they can be easily re-activated by the Narrator, if needed.

## Changed:

-   Core Conditions moved out of the Stats Tab and into the new Effects Tab, functionality remains the same.
-   Compendiums are now built automatically when we release a new version of the System. Previously this had to be done manually and caused extra effort in making new releases that included changes to Compendiums, now the process takes fewer steps and it's less error-prone. This is a developer feature and won't affect the gameplay in any way.

# Closed Beta v0.8.128 [2023-12-13]

## New Features:

-   Introducing the new Active Effects system, available in Beta Testing mode. This new system will allow you to create custom effects that can be applied to Actors and Items. This feature is in active development and will be out of Beta Testing during Early Access v0.9.
-   Added new Status Effects, available to Narrators via Right-Clicking a Token in the Canvas. This feature is in Early Access Final Testing and will be available to all players with Early Access v0.9
-   Introducing the Targeting system. Now players are able to utilize the built-in Targeting functionality that Foundry VTT provides and the Target Names will be displayed as part of the Activation of a Metapower or Possession. This feature is in Early Access Final Testing and will be available to all players during Early Access v0.9.

## Changed:

-   All Actor Types (except Vehicles) can now have Possessions, and the Actors that can only use Strikes will not have any other Possession Categories available. Also, adding an Item to an actor that can't have that type of Item, will now display a warning in the console and not allow the Item to be added to the Actor (for example you are no longer able to add a Metapower to a Human anymore)
-   Added Separators to more cleanly display the various different sections of the Item Sheets and in Chat Messages

## Fixed:

-   Fixed the logic in how Active Effects are being calculated, now they correctly take place after the Base Scores are calculated and not before. This ensures Active Effects will override any Base Scores if applicable
-   Fixed an issue with the sorting of Combatants that triggered an error if you load a World with a Combat already in progress. Now it will correctly skip invalid Combatants during World initialization
-   Optimized performance for the assignment of the icon for the Prime Metapowers for Actors, now it will only run at World Initialization and when an Actor is placed on the Canvas and not every time the Actor Sheet is rendered
-   Fixed various minor typos and improved the code documentation

## Deprecated:

-   Deprecated the 'Earth Walk' Buff as part of the Burgundy Rules Version. It will be removed with Early Access v0.9

# Closed Alpha v0.8.95 [2023-11-24]

## Changed:

-   Changed Extradimensional, Extraterrestrial and Artificial Actors to be hostile to players by default

## Fixed:

-   Fixed an issue with the 'Finalize Premade Actor' button, that was not updating the Token's Name properly if it already existed in the Scene
-   Added Background Image to the Whisper and Blind type of Chat Messages
-   Removed VS Roll from the Possessions Tab as Possessions do not use VS Rolls
-   Fixed an issue with the Journal Pages and Shown Journal Pages to players that was not displaying images correctly

# Closed Alpha v0.8.90 [2023-11-23]

## New Features:

-   Added New Compendium: 'Premade Protagonists' that contains 10 Protagonists, each with a Prime Metapower of each of the 10 Classifications. These are ready to be Finalized by the Player
-   Added New Compendium: 'Introductory Adversaries' which contains 5 Conductors and 5 Adversaries. Conductors are powerful Metanthropes that are meant to be used as NPCs that guide the Introductory Story. The Adversaries are Non-Linked Wildcard Actors (meaning they get a random token image in the Canvas) and are meant to be used as opponents for the Introductory Combat Encounter
-   Added New Compendium: 'Metapowers' which includes all the Metapowers that are used in the Introductory Session.
-   Added New Compendium: 'Possessions' which includes all the Possessions that are used in the Introductory Session.

## Changed:

-   Changed the Metapowers and Possessions tabs on the Actor Sheet. Now they are part of the new Responsive UI and will display different columns based on the width of the Actor sheet window
-   Changed how Metapowers and Possessions are rolled. Now you can Click or Right-Click on the Icon of the Metapower or Possession to Roll it
-   Updated the 'Narrator Toolkit' Compendium with updated Macro functionality and cleaner UI

## Fixed:

-   Fixed an issue with the new Responsive UI background that was causing some images to not display properly
-   Fixed an issue with importing Actors from Compendiums, that was causing the imported Actor to reset their Portrait Image to the Actor Types' Default. Now only new Actors with the name that includes 'New' will be subject to the default image setting

# Closed Alpha v0.8.81 [2023-11-22]

## New Features:

-   Added buttons on the header of the Actor sheet to resize the Actor sheet to 5 preconfigured states: Single Column, Small, Medium, Normal (default) and Extended. You can still resize the sheet manually to your liking and now the UI will change the ammount of information it displays based on the width of the new size when you release the button. Clicking on the first two, will also switch your active tab to the Actors' Stats
-   Added the Effects tab in the Actor sheet, where you can see all the Active Effects that the Actor has, the Immunities, Detections and Shifts as well as a section with Movement, Resistances and Cover information. This tab will be further expanded in future releases
-   Beta Testing of New Features (Narrator Only): You can find a new setting in the 'Configure Settings -> Metanthropes' Section where you can turn on the 'Enable Beta Testing of New Features' option. This will allow you to test new features that are currently in development. This feature is turned off by default
-   New Console Logging functionality: Added a new setting that can be found in the 'Configure Settings -> Metanthropes' Section where you can turn on the 'Enable Advanced Logging' feature. This becomes handy, if you encounter a bug, to collect more information that will assist us in troubleshooting. This setting also enables a new icon on the Actor and Item sheets that outputs the document to the Console. This feature is turned off by default
-   Added the 'Narrator Toolkit' Compendium, a collection of Macros designed to help the Narrator with the game flow and automate the End of Scene/Session/Arc player awards. Two utilities to help you manage your Protagonists' Details and Stats also exist. You can find it in the Compendiums Tab of the Sidebar - available for Narrators and Assistants only
-   Added 'Reduction' to the Custom Roll dialog, when Right Clicking on an Item Roll. This integrates with the existing automations when Rolling and will show the effects on the Chat. This acts as a placeholder for the upcoming Aiming & Targeting system
-   Added the 'Humanoid Hit Location' Rollable Table to be able to quickly roll for a random location on the human body. This is a placeholder for the upcoming Aiming & Targeting system
-   Added the Cover Roll by clicking on any of the 4 Cover Types under the new Effects Tab. This is a random d100 roll that you can spend Destiny to reroll. This is a placeholder for the upcoming Aiming & Targeting system
-   Added automation for the Bleeding Core Condition. During Combat, if an Actor has the Bleeding Condition, they will now automatically lose 1 Life per Level of Bleeding, at the end of each Combat Round
-   Added automation for the Hunger Core Condition. Every time the Actor attempts a roll, they will now first have to overcome a Hunger Check. If they fail, their action is canceled and they can spend Destiny to reroll the Hunger Check until they succeed. Once they do, ther initial attempted action will resume execution
-   Added automation for the Fatigue, Unconsious and Asphyxiation Core Conditions. During Combat, if an Actor has any of these Conditions, they will now be informed in the chat at the end of each Combat Round about what is the effect of that Condition. This will help keep the Narrator and Player informed about the status of the Actor and any further rolls or actions that might be required
-   Added automation for the Duplicate Self Metapower. It used to require many extra manual steps from the Narrator, now the process is fully-automated, requiring the Narrator to only do a right-click on the Actor in the Sidebar and select 'Duplicate' for the Actor that has successfully activated the Duplicate Self Metapower. Instead of the normal 'Actor (Copy)', there will be a new 'Actor (Duplicate)' created. Then the Narrator, can drag the new Duplicate to the Canvas, as many times as the number of Clones required. The Duplicates will have the correct Stat Scores and Maximum Life, will not have any Effects, Conditions or Buffs applied, will not have any Metapowers or Possessions besides 'Strike' and will be unlinked from the original Actor, allowing for multiple Tokens on the Canvas. Players can fully control their Duplicates and can use the Tab key to switch between them
-   Added Automation to equip the Possession 'Strike' to all New Humanoid Actors

## Changed:

-   Cleaned up and improved the majority of the code documentation. This is a non-visual change that won't affect the gameplay in any way, but will help other developers (and myself) when reviewing and making further changes to the code
-   The World now automatically becomes unpaused when the Metanthropes System Finishes Loading
-   Changed some of the images & code used in the UI to scale better with the new Responsive UI
-   When using a Possession that requires a Perk Skill at a certain Level, it will now Reduce the result of the roll, instead of imposing a Penalty on it. Note that Reductions stack with each other, so trying a Multi-Action, together with missing Perk Skill Levels, will now greatly reduce your chances of using that Possession successfully
-   When you mouse-over the Name of a Metapower or Possession, you will now see a tooltip with the Effect of that Item. Clicking on the Name will open the Item sheet, as before
-   Removed the 'Sheet' Button from the Header of the Actor and Item sheets. This was used in development and no longer needed
-   Removed the Close and Cancel buttons (as well as the ability to close the dialog with 'Esc') from the Roll New Actor process. You can still cancel the process, before you make your first roll. If any error is detected during the process, it will automatically reset itself and you can start over
-   Added the word 'Spend' to re-rolling d10 button in the chat, to make it more clear that you are spending Destiny to reroll the dice
-   Changed the Chat message when Rolling Dice, by adding '(needed ## or lower)' in the result message, to indicate the Roll Result you need, in order to Succeed in the Roll. This takes into account all Bonuses, Penalties, Reductions and Pain that apply to the roll and it also works for Cover and Hunger Rolls
-   Refactored the Actor Sheet, consolidated 11 sheets (per Type) into a single document that is dynamically created & rendered based on the Actor Type and features that Actor needs
-   Added some validation logic to the 'New Actor' and the 'Finalize Premade Protagonist' processes, to ensure required values are set properly
-   Added support for 3rd party Module [Hide Player UI](https://foundryvtt.com/packages/hide-player-ui) to conseal UI elements not used by players, great for the New Player Experience
-   Added a field called 'Permanent Effects' to Items (Metapowers/Possessions) to distinguish between activated Effects that show up in Chat and Permanent Effects that are always active. Renamed 'Effect Description' to just 'Effect'
-   Added new fields to Items to indicate the VS Stat Roll, any Permanent Buffs and the Area Effect (Type). These will show when applicable in the Item Sheet and the Chat
-   Changed Support for Item Piles 3rd Party Module. This module is used to be able to create containers (like loot chests) and for players to be able to drop & pickup items from the canvas and also trade items between them. Now Items Piles will only work for the 'Vehicle' Actor Type (to make them into containers) and with only 'Possession' Item Types for Trading and Dropping/Picking up from the Canva & Containers
-   Duplicate Clones now behave properly when having multiple Duplicates from various Actors in a Combat Encounter. They will now be properly shorted at the end of each Combat Round, based on their Reflexes Score, with the ones that have higher Reflexes going first
-   Gave the Narrator the ability to change an Actor's available Destiny on the fly, by changing the value in the Actor's sheet. Note that Destiny is awarded properly via the 'Narrator Toolkit' Macros and this is only meant to be used manually in special cases
-   Introduced Tooltips v2 to take advantage of Foundry's built-in tooltip system. This results in bigger tooltips that are faster to render and easier to read
-   Added Chat Messages for Starting and Ending a Combat Encounter, as well as at the start of each Combat Round. Additionally, we don't allow an Encounter to Begin & New Cycle to continue & to click on the Previous/Next Rounds/Turns buttons, if there are Combatants that haven't rolled their Initiative yet

## Fixed:

-   Fixed various minor issues and optimized the code for better performance and error handling
-   Fixed an issue that caused a graphical glitch when right-clicking on an Actor's Token, now it correctly displays all the elements without overlapping
-   Fixed Pain Condition to only change your result to Failure if it is greater than your Levels of Success. Previously it would also give you Levels of Failure, which was not intended
-   Fixed an issue that was causing d10 rolls to explode on 1's and 2's when it was not intended to do so
-   Fixed an issue that caused non-Narrator players to see 3 Error Notifications saying something similar to: 'Player cannot update the combat document', every time a new Combat Encounter started

## Known Issues:

-   Adding a new Item (Metapower, Possession) to an Actor, will hide the Stat Scores on the Item pages. This is a visual bug and to fix, either make any roll with the Actor, or change the Actor Sheet size via the icons on the header, or close and re-open the Sheet
-   Resizing the Actor Sheet manually, is not a real-time effect and needs a second after releasing the resize control to change the UI. We'd like to make it real-time in the future, after we investigate the performance impact this change would have

## Deprecated:

-   Old Cover system is now deprecated and will be removed in v0.9

## Removed:

-   Removed the old Item and Actor definitions that were deprecated in v0.7

## In Beta Testing:

-   New Progression process: Added a new button on the Actor Sheet that will start the Actor progression process, to spend Experience points to increase Characteristics, Stats, Metapowers and Perks. It will also award a Protagonist with additional 25 Life, for every 5.000 Experience points accumulated. This feature is in early development and not functional.
-   Active Effects: Added a new section to the Actor Sheet that displays all Active Effects that the Actor has. This feature is in early development and not functional.
-   Targeting: Testing the new Targeting feature, now when Activating a Metapower or Using a Posssession, there will be an extra Chat message, indicating the targets that were selected. This feature is for testing the targeting feature and evaluating how it will be used in conjuction with the Execution of Metapowers/Possessions and not truly functional yet.

# Closed Alpha Version: v0.7.85

## Added:

-   Fully automated Stat, Initiative, Metapower, Possession and Strike Rolls. Right clicking allows the player to set custom options
-   New approach to rolling a new Protagonist. 10 steps designed to guide the player throughout the creation process
-   New tooltips (mouse over to see information) for the majority of the UI elements of the Actorsheet
-   New Protagonist ActorSheet sections: Notes & Summary
-   Movement Score is now automatically calculated based on Speed, Weight and Size and is reflected in the grid when you move your Actor. Green is for normal movement, Yellow for Additional Movement, Orange for Sprint and Red for no more movement. (requires Drag Ruler module)
-   Besides being able to click (or right-click) on the Stat for a Metapower or Possession tabs in your Actorsheet to roll it, you may now click on the Stat on the top of the Metapower or Possession sheet to roll it as well
-   Possessions now may require a Perk to be a certain Level and will add a -10% Penalty to the roll for each Level missing
-   Activations for Metapowers and Possessions that are 'Always Active', now properly prevent you from rolling the dice and display an information message in the client instead
-   When Activating a Metapower and when Using a Possession and an Actor' Rolls a Critical Success/Failure and/or when the Actordoesn't have enough Destiny to spend on rerolls, the Metapower or Possession will auto-activate and the result will be displayed in the chat
-   An Actor's Initiative will now automatically roll with the highest amongst Awareness, Reflexes and Perception, as long as the Actorhas the appropriate Metapower like Danger Sense (6th Sense) and Temporal Awareness (Time Bending)
-   Pain now is automatically calculated, lowering your levels of success and informing you about it in the chat
-   Non-linked Actors are now available to Narrators
-   Introduced Narrator's Toolbox: a set of Narrator-only macros designed to help with the game flow and automate the end of Scene/Session/Arc player awards
-   New Supported module: Carousel Combat Tracker (PR pending)
-   New Supported module: DF Chat Enhancements
-   New Supported module: Monks' Token Bar
-   New Supported module: Streamer View

## Changed:

-   Foundry version 11 is now required
-   Change Log (this page) will from now on follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
-   Revamped the Actorsheet to be more intuitive and take less screen 'real estate'
-   Metapowers and Possessions details are now only editable by Narrators
-   Revamped the Items sheets (Metapowers & Possessions) to be more intuitive and take less screen 'real estate'
-   Changed Destiny Reroll button in chat, to now only be visible to the owner of that Actorand the Narrator (currently requires module DF Chat Enhancements)
-   Protagonists and Metanthropes are now Actor-Linked to their tokens, all other Actor types are not linked by default
-   New Actors will now have their token default values change once the 'Roll new Actor' 10-step process is completed. The 'Finish Premade Protagonist' button will also trigger similar changes. This controls the visibility of the Name, Life & Destiny Bars and disposition towards other actors: Protagonists are Friendly to each other, Metatherions are Hostile and other actors are Neutral by default.
-   All built-in d20 references have been changed to d10 dice
-   When an Actor's maximum Life drops (because of Burned condition for example) and their current Life is now greater than their new maximum Life, their current Life will now be set to the new maximum

## Fixed:

-   Fixed a known issue with the Metapower & Possession Sheets not displaying Stat Scores correctly after rolling
-   Fixed an issue where chat displayed 'null' when using an item with an empty Effect Description
-   Fixed an issue where the Combat Tracker did not display the correct values for the current Cycle and Round
-   Fixed an issue where after changing into a new Cycle and rolling a new initiative, the Combat Tracker did not order the Turn order correctly
-   Fixed a minor bug where Maximum Life would sometimes not calculate correctly if the Actor had negative Stored Experience

## Deprecated:

-   Deprecated the Items and Actors from previous versions. They will still open in v0.7 allowing you to migrate any data you need to the new Actors and Items. These will be removed in v0.8

## Unreleased:

-   Progression of Characteristics and Stats, Metapowers and Perks (scheduled for v0.8)
-   Official support for modules: Terrain Ruler and Enhanced Terrain Layer (scheduled for v0.9)
-   Size Score will now properly buff unarmed strike dice damage (scheduled for v0.9)

### 0.6.00 - 0.6.20

-   New Player Experience: New Character sheet for protagonists with better UI and UX
-   New Player Experience: New Actor Creation workflow with automations and drop-down menus
-   New Player Experience: Left Clicking on a rollable Stat now will automatically roll and apply proper conditions (eg. Penalty from Disease)
-   New Player Experience: Right Clicking on a rollable Stat now will open a dialog with options to add a bonus and a penalty, and a Multi-Action reduction
-   XP System: Starting Perks now are free and don't cost XP
-   Bug Fixing (Critical Failure Roll with Stat>100 had wrong total Levels of Fail calculation)
-   File Naming fixes

### 0.5.00 - 0.5.37

-   Possessions: Possessions Sheet
-   Possessions: Chat Roll Message Results & Destiny Re-Roll
-   Possessions: Use Chat message depends on the Possession Category & Attack Type & Destiny Re-Rolls for Extras
-   Combat: Initiative Re-Rolls for Destiny, Roll-all-NPCs with a single click
-   Combat: Rolling Initiative with Danger Sense (6th Sense) Metapower equipped rolls with Awareness instead of Reflexes
-   Combat: Rolling for Initiative with 0 Stat correctly now doesn't allow you to roll and puts you on the bottom of the initiative list
-   Combat: Cycles and Rounds and Initiative Re-Rolls as needed
-   Combat: Initiative Ordering (Issue: single sound effect if roll all/npcs & award destiny for double ties and reset initiative & hidden chat messages for hidden-combatants)

### 0.4.00 - 0.4.20

-   Metapowers: Activation & Effects on Chat & Re-Roll Extras
-   Combat: Metanthropes RPG Basic Initiative Rules

### 0.3.00 - 0.3.16

-   Custom Bars for Destiny & Life
-   Metapowers: Metapower Sheet (Known Issue)
-   Characteristics & Stats: Dropping to 0 or lower triggers a Notification in the UI and disables any kind of rolls with that Stat
-   UI Customization

### 0.2.00 - 0.2.64

-   Protagonist Sheet
-   Perks: Sheet
-   XP System: Progressed Characteristics and Stats (Known Issue)
-   XP System: Perk Progression Automated XP Spending
-   Metapowers: Metapower Activation

### 0.0.102 - 0.1.99

-   Levels of Success & Failure and Stat Roll automated checks
-   Critical Success & Failure and automatic Destiny awarding
-   Multi-Actions, Automated Destiny Re-Rolls, and Bonus & Penalties in Rolls
-   Life Max value auto calculation
-   Movement value now determines the additional & sprint movement automatically and updates Drag Ruler mod to correctly display movement distances in the canvas
-   Initiative Roll and Combat System basics
-   Improved Foundry UI customization and more functional Actor and Item sheets

### 0.0.01 - 0.0.102

-   Initial Metanthropes System configuration, settings and Rules integration with Foundry VTT
-   Metanthropes RPG Characteristics & Stats, Buffs and Conditions & auto-calculations
-   Actor and Item sheets and minimal branding
-   Based off the Boilerplate System for Foundry VTT v.10 by Asacolips, found [here](https://gitlab.com/asacolips-projects/foundry-mods/boilerplate)
