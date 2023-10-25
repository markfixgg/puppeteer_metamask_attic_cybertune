# freelance-metamask_minter

# Fill in configs
1) In config file fields that need to be configured: 
   1) DOLPHIN_BEARER - API key that can be generated at Dolphin site (dashboard => settings)
   2) DELAYS - array with delays in milliseconds, timeout function will take random value from it
   3) SHEET_ID - id of google spreadsheet. 
      4) Example: https://docs.google.com/spreadsheets/d/1NCvQhTMhgbpIXdsUVQkT6oQJNzw4fHUA3DF0p-hdn5U/edit#gid=2103905887
      5) ID in this case is: 1NCvQhTMhgbpIXdsUVQkT6oQJNzw4fHUA3DF0p-hdn5U
2) In config folder we need to put service account credentials, to access the spreadsheet API, how to obtain, you can find [in this article](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication)
3) In assets folder we need to put:
   1) messages.json - array of messages (array of strings)
   2) accounts.json - array of accounts in format ```{ "id": 0, "password": "", "wallet": "", "priority": 0 }```
   3) assets/iterations - contains json files with id of profiles that already passed the iteration. File name format is "date.json". Example:  ```2023-06-13.json```

# Install dependencies
1) Download ```NodeJS "LTS" version``` from [here](https://nodejs.org/en)
2) Open folder in command line, or code editor
3) Install required libraries: ```npm i```

# Run the project
1) Compile project to JavaScript (source code is in TypeScript): ```tsc```
2) Start iteration: ```node .```

# Modifying code
1) Timeouts:
   2) In utils.ts file we have two functions:
      3) timeout - static timeout, ex: ```timeout(3000)``` *will be always 3s*
      4) random_delay - take delay from array
