# LEMA
LEMA: The Linguistic Etymology Map Assistant

## Description
LEMA is a tool that allows people to create custom etymology maps, as seen on the /r/etymologymaps subreddit (https://reddit.com/r/etymologymaps).

## Online Access
LEMA is not currently hosted online due to IP-related reasons. Please check back after ~20th of May (my dissertation defence date).

## Offline Installation

### Download Code
Download the code from the dev branch of the GitHub repository. You can do this either by cloning the repository or by downloading the ZIP file and unzipping it.
### Download and Install PouchDB
In order to create a user profile, log into that profile, save maps, load maps, and use the Community Showcase, you must first download and install PouchDB.
After doing so, you must change the configuration details for the database on line 7 of the following files:
 * /server/routes/jwt.js
 * /server/routes/maps.js
 * /server/routes/users.js
You can optionally ignore this step, but it will limit the functionality of the app.
### Download and Install Node.js
You must download and install Node.js to run LEMA locally: https://nodejs.org/en/download/releases/. Any version should suffice.
### Install Module Dependencies
Through either your IDE’s in-built Node terminal, or through your operating system’s terminal, navigate to the root directory of LEMA and run the following commands:
  1.	cd server
  2.	npm install
  3.	cd client
  4.	npm install
### Run LEMA
In order to run LEMA locally, the following commands must be run in order (from the root directory):
  1.	cd server
  2.	npm start (then wait for the server to start – it will say “Listening on port 5000”)
  3.	cd client
  4.	npm start
Then navigate to http://localhost:3000 or wait for your IDE to open the app.

## Discover Etymological Connections

**Note: The cognate mode search function is currently disabled. Please check back soon!**

To begin your etymological journey, simply select "Historical journey" mode and search for a word of your choice from one of LEMA's supported languages.

## Tweak Your Map

You can tweak your map by either right-clicking on the map itself or by clicking on the collection node items in the collection area on the left.
You can also add more collections if you like, each containing as many nodes as you want!

## Save Your Map

You are more than welcome to register for a LEMA profile so that you can save your maps to it! 
After registering and logging in, you'll find the option to save your map by clicking the "Save Maps / Export" button in the navigation banner.

## Share Your Maps with the Community!

Want to contribute to a larger linguistic community? Then feel free to share your maps with the community!
After clicking "Save Map / Export", you can choose to "Share to showcase" - your map will then be publicly available to everybody else!

## Export/Import

You can also export your maps as an image. If you wish to save a local copy to be edited later, then select "Export as JSON file" on the Save modal and hit "Export".
You can then imort your maps by clicking on "View Maps / Import" on the navigation banner.
