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
<br>:construction::construction::construction:

### Resources

##### [BuildStruct](https://github.com/brendanprice2003/QueryVendorBounties) -
Clone my (and use the Readme.md) BuildStruct repo to query bounties that are actively being sold by a specified vendor via vendorHash

##### [Destiny Datasets](https://data.destinysets.com/) -
You should also utilize destinydatasets to query each bounty via the definitions to determine the bounty properties

# Reproduction

Clone this repository.

Repeat the below process for each entry, over the entire list, yielded from BuildStruct
1. `ctrl+f` for the hash in `bounties.js`
2. Make a `Destiny2.GetDestinyEntityDefinition` request on destinydatasets:<br>

    ```
    {
      entityType: DestinyInventoryItemDefinition,
      hashIdentifier: hash
    }
    ```
3. Determine what indexes the bounty will fall under (see exemplar below)
4. Enter corresponding indexes for the props in `bounties.js` using `SynergyDefinitions.js`

## Example

Here we can see the console output from my QueryVendorBounties tool that I made:
![image](https://user-images.githubusercontent.com/56489848/185819142-d72e23fa-6d67-4d7d-b664-29be5b0bea17.png)

Each item has a hash; take this hash and put it into destinydatasets.
![image](https://user-images.githubusercontent.com/56489848/185819205-5c5c9c33-beb1-4f3e-9121-2bb9c8d9855a.png)

You then have a nice list of all the information you could ever want to know about the bounty, which you should then use to determine what indexes this bounty will go under inside of the `bounties.js` script.

Ctrl + F for the same hash in `bounties.js`.
(https://github.com/brendanprice2003/D2-Synergy/issues/23#issuecomment-1133815453)

This bounty has already been done by someone. Then entry has keys that contain and array of indexes that refer to another key value inside of [`SynergyDefinitions.js`](https://github.com/brendanprice2003/D2-Synergy/blob/main/www/assets/scripts/utils/SynergyDefinitions.js).

For example you can see that the `itemCategory` key value has an array of indexes that only contains `0`. If we find `itemCategory` inside [`SynergyDefinitions.js`](https://github.com/brendanprice2003/D2-Synergy/blob/main/www/assets/scripts/utils/SynergyDefinitions.js), you can see it has all the possible indexes that are valid for that property. 
![image](https://user-images.githubusercontent.com/56489848/187028214-acf601ee-0b9a-4db3-94da-4da89cdde1ae.png)

You would then put the relevant indexes in the corresponding properties for that bounty.

:construction:

*Note: `SynergyDefinitions.js` will have more indexes in the future to better signify deeper relationships such as, enemy race types and "killstreaks" bounties. Adding heuristics manually for these new(er) indexes will not be necessary as string matching will suffice.*
