# Contributing
**Contriubting helps the project progress a huge amount. Read on to learn about standards and information on contributing.**

**Before continuing, ensure that you have configured a development environment. You can use [this wiki page]([https://github.com/brendanprice2003/D2-Synergy/wiki](https://github.com/brendanprice2003/D2-Synergy/wiki/Developer-Guide)) if you haven't.**

## Contents
* [Resources]()
* [Standards](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#standards)
* [Heuristics](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#heuristics)
* [Reproduction](https://github.com/brendanprice2003/D2-Synergy/blob/main/CONTRIBUTING.md#reproduction)


# Standards

*Not all syntax may conform to these standards, however, it is good practice to have a general rule for how to format 'things' :)*

`variable` names are camelCase.<br>
`function` names are PascalCase.

Some `variables` may include arrays and objects; they *should* inherit the same standard. An exception to this standard is if the right hand is a method that returns a promise, In which case you should use PascalCase.

For example, I want to fetch data for the players characterProgression; I would use an `await axios.get()`. This means that the variable I assign the response to is going to follow the PascalCase scheme.

### HTML/CSS

Each element has it's own style in an external `.css` file, which tends to follow an "order" inside of each CSS element reference. This standard doesn't matter as much as the above. This is almost an optional standard.. but is still a nice-to-have.

There are currently no standards for HTML syntax. (Please make it readable, even if HTML isn't a language)

The layout of element CSS properties follow a standard via:

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
**There are a few main points of focus when it comes to heuristics:**

* `/data/bounties.json`
* `/scripts/utils/SynergyDefinitions.js`
* `/scripts/utils/MatchProps.js`

1. `/data/bounties.json` is a hash map that contains all the bounties that currently exist on the Bunige.net API
2. `/scripts/utils/SynergyDefinitions.js` contains the definitions to translate the indexes found in bounty entries from `/data/bounties.json`
3. `/scripts/utils/MatchProps.js` mutates the actual bounty entry, that is present in `charBounties` in `user.js` and adds a `.props` property that contains an array of corresponding strings, translated using `/scripts/utils/SynergyDefinitions.js`.

todo
