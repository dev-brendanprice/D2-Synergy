
// Bounty type
var itemTypeKeys = [
    'weekly',
    'daily',
    'repeatable'
]

// Vendor groups
var vendorKeys = [
    'clan',
    'cosmodrome',
    'crucible',
    'dawning',
    'dreaming_city',
    'edz',
    'eternity',
    'europa',
    'fotl', // Festive of the Lost
    'gambit',
    'gunsmith',
    'iron_banner',
    'luna',
    'myriad', // Nessus
    'solstice',
    'spring', // guardian games?
    'strikes',
    'throneworld',
    'transmog',
    'trials',
    'war_table',
    'other'
];

// Normal XP gains
var baseYields = {
    'weekly': 12_000,
    'daily': 6_000,
    'repeatable': 4_000
};

// Petra Venj XP gains
var petraYields = {
    'weekly': 6_000,
    'daily': 1_000,
    'repeatable': 0
};


export { itemTypeKeys, vendorKeys, baseYields, petraYields };