# D2 Synergy - Contributing

Contributing helps the project progress a huge amount. Carry on below to find about how you can contribute using this projects' standards.<br>
If a commit does not follow standards, I won't reject the commit, It just means I have to spend extra time re-factoring the commit..

# Standards

*Please excuse me if some syntax does not follow the below standards. Sometimes I miss some things out :)*

`variable` names are camelCase.<br>
`function`/`method` names are PascalCase.<br>
`Async method operand` names are PascalCase

Some variations of `variables` may include arrays and objects; they *should* inherit the same standard. An exception to this standard is if the right hand is a method that returns a promise, In which case you should use PascalCase.

All progress that is commited must have some sort of comment present, unless it is on a branch that could be seen as a "burner" or "rubbish heap".
This does not mean that you should comment every line. A comment for each code block should be enough.

#### HTML, CSS

I had originally just decided to use `id` as the default identifier for an element. A `class` may be used in the case of an element where there is more than one identifier or a temporary identifer other than `id`.

The layout of CSS props follow a standard via:

```
.el {
    display;
    position;
    top,bottom;
    margin;
    padding;
    element size;
    alignment;
    typography;
    misc;
}
```

# Heuristics

`scripts/utils/data/bounties.js` contains a hash map of all the bounties that have ever existed on the API.
`scripts/utils/SynergyDefinitions.js` contains `key:value` pairs, that signify the indexes in each prop from a given bounty in `scripts/utils/data/bounties.js`

To figure out what heuristics you should be contributing:
:construction::construction::construction:

### Resources

##### [BuildStruct](https://github.com/brendanprice2003/QueryVendorBounties) -
Clone my (and use the Readme.md) BuildStruct repo to query bounties that are actively being sold by a specified vendor via vendorHash

##### [Destiny Datasets](https://data.destinysets.com/) -
You should also utilize destinydatasets to query each bounty via the definitions to determine the bounty properties

### Reproduction

Clone this repository.

Repeat the below process for each entry, over the entire list, yielded from BuildStruct
1. `ctrl+f` for the hash in `bounties.js`
2. Make a `Destiny2.GetDestinyEntityDefinition` request on destinydatasets for the same bounty hash where thes are your parameters:<br>
      `entityType: DestinyInventoryItemDefinition,
       hashIdentifier: hash`
3. Enter corresponding indexes for the props in `bounties.js` using `SynergyDefinitions.js`

Once all bounties have been done, perhaps you could quickly check over them, then make a pull request, to a branch with your chosen name and a good commit title. :)

*Note: `SynergyDefinitions.js` will have more indexes in the future to better signify deeper relationships such as, enemy race types and "killstreaks" bounties. Adding heuristics manually for these new(er) indexes will not be necessary as string matching will suffice.*
