# D2 Synergy - Contributing

Contributing helps the project progress a huge amount. Follow this .md to find out how you can contribute properly.

### Heuristics

`scripts/utils/data/bounties.js` contains a hash map of all the bounties that have ever existed on the API.
`scripts/utils/SynergyDefinitions.js` contains `key:value` pairs, that signify the indexes in each prop from a given bounty in `scripts/utils/data/bounties.js`

To figure out what heuristics you should be contributing:
- Refer to pull requests and determine missing vendors
- Validate heuristics for a vendor(s)
- Ask me :)

### Resources

##### [BuildStruct](https://github.com/brendanprice2003/QueryVendorBounties) -
Clone my BuildStruct repo to query bounties that are actively being sold by a respective vendor

##### [Destiny Datasets](https://data.destinysets.com/) -
You should also utilize destinydatasets to query each bounty via the definitions to determine what the bounty entails

### Process

Clone this repository.

Repeat the below process for each entry, over the entire list, yielded from BuildStruct
1. `ctrl+f` for the hash in `bounties.js`
2. Make a `Destiny2.GetDestinyEntityDefinition`, on destinydatasets, for the same bounty hash:
      `entityType: DestinyInventoryItemDefinition,
       hashIdentifier: hash`
3. Enter corresponding indexes for the props in `bounties.js` using `SynergyDefinitions.js`

Once all bounties have been done, perhaps you could quickly check over them, then make a pull request, to a branch with your chosen name and a good commit title. :)

*Note: `SynergyDefinitions.js` will have more indexes in the future to better signify deeper relationships such as, enemy race types and "killstreaks" bounties. Adding heuristics manually for these new(er) indexes will not be necessary as string matching will suffice.*
