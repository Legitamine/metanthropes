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
@echo Welcome
@echo -------
call fvtt package unpack "welcome" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/welcome"
@echo System
@echo ------
call fvtt package unpack "system" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/system"
@echo Rolltables
@echo ----------
call fvtt package unpack "rolltables" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/rolltables"
@echo Toolkit
@echo -------
call fvtt package unpack "toolkit" --out "D:/FoundryDev/legitamine/metanthropes/src/packs/toolkit"
@echo -------------------------------
@echo Finished Unpacking Compendiums
@echo -------------------------------
@echo Press any key to exit
pause
