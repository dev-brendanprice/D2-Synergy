# Contributing
**Contriubting helps the project progress a huge amount. Read on to learn about standards and information on contributing.**

**Before continuing, ensure that you have configured a development environment. You can use [this wiki page](https://github.com/brendanprice2003/D2-Synergy/wiki/Developer-Guide) if you haven't.**

## Contents
* [Resources](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#resources)
* [Standards](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#standards)
* [Heuristics](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#heuristics)
    * [Data Structure](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#data-structure)
    * [Adding Entries](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#exemplar)


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

(1) *For example, I want to fetch data for the players characterProgression; I would use `await fetch()`. This means that the variable I assign the response to is going to follow the `PascalCase` scheme, as the aforementioned function returns a promise.*

# Heuristics
**Synergy has a lot of heuristics that are manually entered, so I strongly recommend you read and *try* to understand.**

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
**This section explains how synergy processes the heuristics into meaningful information for the user. (and the rest of Synergy)**

* Every bounty that is fetched from a players inventory can be cross-referenced, via hash, using the corresponding json files.
* Each bounty is mutated and gains a `props` array that contains all the strings, yielded from `MatchProps.js`.

**Then entire process can be characterized by this flowchart:**

![image](https://user-images.githubusercontent.com/56489848/194653354-9f426da9-555b-41b2-97d3-dba16a865b63.png)

## Adding Entries
**Manually adding entries to Synergy is, by far, the best course of action to ensure that the accuracy of synergies, between progressional items, are as vast and best as possible. (Or at least "mostly" reliable.)**

**This section contains a step-by-step guide on how to efficiently add entries to D2 Synergy. I recommend that you utilize my tool: [QueryVendorBounties](https://github.com/brendanprice2003/QueryVendorBounties) for this process.**

**Note:** _Vendors' bounties are added via an order of priority. This priority is determined by which vendors are utilized the most in terms of XP gains. For example: A Vendor like Eris Morn would be quite a high priority vendor to add, because the moon is notorious for its quick XP farms._

**Once you have followed this guide, you should have a development environment ready to go:**

### Adding Bounty Entries:
1. Use [QueryVendorBounties](https://github.com/brendanprice2003/QueryVendorBounties) to get all the bounties from a vendor. ([Read Here for info on that](https://github.com/brendanprice2003/QueryVendorBounties/blob/main/README.md))
2. Going down the list of bounties that are returned, Take the hash and `Ctrl+f` for that entry inside of `bounties.json`. Also dropdown the object that is returned under the `Item Hash: 2655712924` log.
   * The information inside of `displayProperties` refers to what the bounty entails.
3. Navigate to `SynergyDefinitions.js` and find the corresponding definition arrays. (These can be found at the bottom)
4. For every property in the bounty entry, you need to enter the relevent indexes.

### Functionality - <span style="color:orange;">Please Read</span>
* If no indexes apply to the current property, remove the property from the entry entirely but keep the others.
* If all indexes apply to the current property, you can leave the array empty. (this is optional)
* If some indexes apply to the current property, enter the corresponding indexes into the array.

### Exemplar:
Take this bounty entry for example:
```json
 "130487539": {
     "Destination": [],
     "ActivityMode": [],
     "DamageType": [],
     "ItemCategory": [],
     "AmmoType": [],
     "KillType": []
 }
```

Current it's empty, which means we need to add indexes to each of its properties. The properties are the `keys` like `Destination` or `ActivityMode`. To do this, we have to fetch information about the bounty using the hash; in this case the hash is `130487539`. By fetching the information about the bounty we are able to determine what exactly the bounty entails.

Using `SynergyDefinitions.js` we should navigate to the definition arrays (at the bottom) and enter in the corresponding indexes, that relate to the bounty objective(s), into each of the corresponding properties.

A populated bounty entry will look like this:
```json
 "130487539": {
     "Destination": [],
     "ActivityMode": [],
     "DamageType": [],
     "ItemCategory": [5],
     "AmmoType": [2],
     "KillType": [9,10]
 }
```

Notice how we left some of the property arrays empty. This is because all the indexes that are defined in `SynergyDefinitions.js`, for that property, all correspond to what the bounty entails. 

Other bounty entries may require you to remove a property if no indexes correspond to the entry property, Like so:
```json
 "552709554": {
     "Destination": [],
     "ActivityMode": [0],
     "AmmoType": [],
     "KillType": []
 }
```
This is not a valid bounty entry btw. It's an entry for a gambit bounty. It's also just an example to show how you would remove a property.
