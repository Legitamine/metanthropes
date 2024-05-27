# Latest Changes

These are the latest changes to the Metanthropes System for Foundry VTT.

Included in these notes, is also the changelog for all the Premium Modules for Foundry VTT by Legitamine Games.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

### Early Access Releases

# Early Access v0.9.xxx [2024-05-xx]

# Fixed:

-   When Combat ends during the first Round of the first Cycle, it will now display the appropriate message in Chat.

# Early Access v0.9.592 [2024-05-27]

# Changed:

-   Changed the Chat message to display the results in a more clear manner, having the final result start in a new line and removed the '\*' that followed the number for Success/Failure and Destiny.
-   Metanthropes: Introductory Module has updated Journals with a few minor fixes & typos and updated the Premade Protagonists with the correct Backgrounds, Narrator Notes and Possessions.

# Fixed:

-   Fixed an issue that was causing NaN error to appear when entering null values in the custom roll options for Bonus, Penalty and Reduction.

# Known-Issues:

-   Metanthropes: Introductory imported scenes do not have the correct thumbnail and instead seem to be empty. To fix, right-click on the Scene and select 'Generate Thumbnail Image'.

# Early Access v0.9.589 [2024-05-26]

# Added:

-   Initial testing for Foundry V12 started. The System will allow running in V12, however, we do not officially support V12 for running games and is only for testing purposes. V12 will bring a plethora of much wanted features such as Scene Regions that we plan to utilize fully for Metapower activations, so more features that utilize and require V12 will be coming soon.

# Changed:

-   The 'Assign Player' button in the Actor Character Sheet, Summary Tab, now does not require a Player to be active (connected to the game) in order to be assigned an Actor.
-   The logic behind the 'Finalize Premade Actor' button on the Actor Summary Tab, is no longer tied to the 'Assign Player' logic. Narrators should use the 'Assign Player' button and Players can then use the 'Finalize Actor' button.
-   Changed the tooltip text on the Create Actor and Create Item / Compendium buttons, to better clarify that during Early Access, these features are available for testing in the Core and Homebrew modules respectively.
-   Re-enabled the creation of Journals & Playlists.

# Known-Issues:

-   You are not currently able to change the Actor's Portrait Image via tha Character Sheet, this functionality will be re-enabled when we introduce the new Portrait Images that will come with the Metanthropes: Introductory Module.

---

# Early Access v0.9.587 [2024-05-21]

# Added:

-   Initial Support for all Metanthropes Premium Modules. Their versions will now follow the build version of Metanthropes System for which they will from on also depend upon & require, in order to install & update.
-   Metanthropes: Introductory added a new Installation Guide, Early Access content included, however it is still missing many of the original artwork planned to be available later during the Summer of 2024.
-   Metanthropes: Core added a new Installation Guide, initial content added, mainly for testing purposes.
-   Metanthropes: Homebrew added a new Installation Guide and barebone content, mainly for testing purposes

# Changed:

-   Final pass for the Compendium restructuring, for both the System and all the Premium Modules. This new structure will now become the foundation for content that will added to the game as we progress through the Early Access milestones.

# Early Access v0.9.552 [2024-05-20]

# Changed:

-   Second pass of re-structuring the Compendiums is complete, now you will see a 'Metanthropes' Folder in the Compendiums Tab and all our content will be from now on placed within this structure, to reduce clutter and improve usability.

# Fixed:

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

# Archived Versions

## Archives

You may find the previous versions of the Changelog in the [Changelog Archives](https://github.com/Legitamine/metanthropes/blob/main/CHANGELOGARCHIVES.md)

Our eternal gratitude goes to the amazing community of Foundry Developers <3
