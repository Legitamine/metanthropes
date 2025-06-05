@echo off
cls
@echo ============================================================================
@echo   Run this file when you have made changes to Compendiums within FoundryVTT
@echo   This script will unpack all the Compendiums for Metanthropes System
@echo   Requires to have Git for Windows installed and configure your own paths
@echo   Make sure FoundryVTT Electron app is closed before running this script!!!
@echo ============================================================================
pause
@echo Installing FoundryVTT CLI
@echo -------------------------
call npm install -g @foundryvtt/foundryvtt-cli
@echo Configuring FoundryVTT CLI to use the correct install path
@echo ----------------------------------------------------------
call fvtt configure set installPath "D:/FoundryDev/V13Composer/code"
call fvtt configure set dataPath "D:/FoundryDev/V13Composer/data"
@echo Configuring FoundryVTT CLI for our use case
@echo --------------------------------------------
call fvtt package workon "metanthropes" --type "System"
@echo Unpacking Compendiums for Metanthropes System
@echo ---------------------------------------------
@echo Demo-Actors
@echo -----------
call fvtt package unpack "demo-actors" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/demo-actors"
@echo Lobby
@echo -----
call fvtt package unpack "lobby" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/lobby"
@echo System
@echo ------
call fvtt package unpack "system" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/system"
@echo Welcome
@echo -------
call fvtt package unpack "welcome" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/welcome"
@echo How-To-Play
@echo -----------
call fvtt package unpack "how-to-play" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/how-to-play"
@echo Hit Location
@echo ------------
call fvtt package unpack "hit-location" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/hit-location"
@echo Toolkit
@echo -------
call fvtt package unpack "toolkit" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/toolkit"
@echo -------------------------------
@echo Finished Unpacking Compendiums
@echo -------------------------------
@echo Press any key to exit
pause
