# Contributing
**Contriubting helps the project progress a huge amount. Read on to learn about standards and information on contributing.**

**Before continuing, ensure that you have configured a development environment. You can use [this wiki page](https://github.com/brendanprice2003/D2-Synergy/wiki/Developer-Guide) if you haven't.**

## Contents
* [Resources](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#resources)
* [Standards](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#standards)
* [Heuristics](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#heuristics)
    * [Data Structure](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#data-structure)


# Resources
**To contribute, I recommend that you make use of these resources.**

* [QueryVendorBounties](https://github.com/brendanprice2003/QueryVendorBounties)
* [Destiny Datasets](https://data.destinysets.com/)
* [Bungie.net API Docs](https://bungie-net.github.io/multi/index.html)


# Standards
**This is an open-source project which means that any one person is able to contribute their own changes. Following coding standards enforces the quality of the project, under several different counts.**

* Syntax inherits a uniform style/appearance
* Improves readability, maintainability and reduces complexity (spaghetti code)
* Enables easy resusability of code and debugging
* Is good practice

### Variable Name Standards

* Specific scope variable names are `camelCase`.
* Function names are `PascalCase`.
* Global/Promise operand variables are `PascalCase`. (1)

(1) *For example, I want to fetch data for the players characterProgression; I would use `await axios.get()`. This means that the variable I assign the response to is going to follow the `PascalCase` scheme, as the aforementioned function returns a promise.*

# Heuristics
**There are a few main points of focus when it comes to heuristics:**

* `/data/bounties.json`
* `/scripts/utils/SynergyDefinitions.js`
* `/scripts/utils/MatchProps.js`

1. `/data/bounties.json` is a hash map that contains all the bounties that currently exist on the Bunige.net API
2. `/scripts/utils/SynergyDefinitions.js` are definitions that are used to translate indexes that can be found in the properties, inside of each bounty from `/data/bounties.json`
3. `/scripts/utils/MatchProps.js` mutates an actual bounty entry, that can be found in [charBounties](https://github.com/brendanprice2003/D2-Synergy/blob/adcc8243e3036eaa011e3740d7e4bb95a5178152/src/scripts/user.js#L73). It does this by taking the bounties hash from `/data/bounties.json`and applying the corresponding translated indexes, to a new `.props[]` array.

* Each entry inside of `/data/bounties.json` has the same default properties, like so:

```json
"13409814": {
    "Destination": [],
    "ActivityMode": [],
    "DamageType": [],
    "ItemCategory": [],
    "AmmoType": [],
    "KillType": []
}
```

## Data Structure


> add a diagram to explain the process better

> add a rough process to contribute bounties
