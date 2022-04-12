
// Bounty type
const itemTypeKeys = [
    'weekly',
    'daily',
    'repeatable'
]

// Vendor groups
const vendorKeys = [
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
    'spring', // Revelry event
    'strikes',
    'throneworld',
    'transmog',
    'trials',
    'war_table',
    'other'
];

// Normal XP gains
const baseYields = {
    'weekly': 12_000,
    'daily': 6_000,
    'repeatable': 4_000
};

// Petra Venj XP gains
const petraYields = {
    'weekly': 6_000,
    'daily': 1_000,
    'repeatable': 0
};

// Hashes for destinations
const DestinationHash = {
    EDZ: 697502628, //0
    Nessus: 3607432451, //1
    TangledShore: 3821439926, //2
    DreamingCity: 1416096592, //3
    Moon: 677774031, //4
    Europa: 1729879943, //5
    Cosmodrome: 3990611421, // 6
    Throneworld: 2244580325, // 7
};

// Hashes for activity modes
const ActivityModeHash = {
    gambit: 1848252830, //0
    strike: 2394616003, //1
    nightfall: 3789021730, //2
    crucible: 1164760504, //3
    mayhem: 1264443021, //4
    control: 3199098480, //5
    breakthrough: 4033000329, //6
    countdown: 1505888634, //7
    elimination: 4078439804, //8
    doubles: 3821502017, //9
    supremacy: 910991990, //10
    rumble: 157639802, //11
    survival: 2239249083, //12
    ironBanner: 1826469369, //13
    dungeon: 608898761, //14
    nightmareHunt: 332181804, //15
    story: 1686739444, //16
    trials: 1673724806, //17
    explore: 3497767639, //18
    daresOfEternity: 2294590554, //19
    raid: 2043403989, // 20
    clash: 2303927902, //21
    momentum: 952904835, //22
    scorched: 1219083526, //23
    lockdown: 3239164160, //24
    showdown: 1457072306 // 25
};

// Hashes for damage type
const DamageTypeHash = {
    Solar: 1847026933, //0
    Arc: 2303181850, //1
    Kinetic: 3373582085, //2
    Void: 3454344768, //3
    Stasis: 151347233, // 4
};

// Strings for weapon type
const ItemCategory = [
    'Auto Rifle', //0
    'Scout Rifle', //1
    'Pulse Rifle', //2
    'Hand Cannon', //3
    'Shotgun', //4
    'Grenade Launcher', //5
    'Rocket Launcher', //6
    'Sniper Rifle', //7
    'Sword', //8
    'Linear Fusion Rifle', //9
    'Fusion Rifle', //10
    'Glaive', //11
    'Submachine Gun', //12
    'Machine Gun', //13
    'Trace Rifle', //14
    'Sidearms', //15
    'Bow', // 16
];

// Hashes for weapon ammuniation type
const AmmoType = [
    'Special Ammo', //0
    'Primary Ammo', //1
    'Heavy Ammo', // 2
];

// Strings for kill type
const KillType = [
    'Melee', //0
    'Super', //1
    'Grenade', //2
    'Finisher', //3
    'Precision', //4
    'ClassAbilities', // 5
];


export {
  itemTypeKeys,
  vendorKeys,
  baseYields,
  petraYields,
  ActivityModeHash,
  DestinationHash,
  DamageTypeHash,
  AmmoType,
  ItemCategory,
  KillType,
};