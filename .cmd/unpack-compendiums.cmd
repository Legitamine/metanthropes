@echo off
cls
@echo ================================================================================================
@echo   Run this in a new Git cmd window when you have made changes to Compendiums within FoundryVTT
@echo   Make sure FoundryVTT Electron app is closed before running this
@echo   Select these commands, CTRL+C, and then right click on the Git cmd window, to paste them and press enter
@echo   This should take about a minute and once complete, you can close the Git cmd window
@echo   todo: use recursion and make it so that it's the same for modules and systems
@echo ================================================================================================
@echo
@echo
@echo Installing FoundryVTT CLI
@echo -------------------------
npm install -g @foundryvtt/foundryvtt-cli
@echo Configuring FoundryVTT CLI to use the correct install path
@echo ----------------------------------------------------------
fvtt configure set installPath "F:/FoundryVTT/Foundry Virtual Tabletop"
fvtt configure set dataPath "F:/FoundryVTT/"
@echo Configuring FoundryVTT CLI for our use case
@echo --------------------------------------------
fvtt package workon "metanthropes" --type "System"
@echo Unpacking Compendiums
@echo ---------------------
@echo Metapowers
fvtt package unpack "metapowers" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/metapowers"
@echo Narrator's Toolkit
fvtt package unpack "narrator-toolkit" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/narrator-toolkit"
@echo Possessions
fvtt package unpack "possessions" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/possessions"
@echo Premade Protagonists
fvtt package unpack "premade-protagonists" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/premade-protagonists"
@echo Premade NPCs
fvtt package unpack "premade-antagonists" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/premade-antagonists"
@echo Rollable Tables
fvtt package unpack "rollable-tables" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/rollable-tables"
@echo
@echo
@echo Finished Unpacking Compendiums
@echo -------------------------------
