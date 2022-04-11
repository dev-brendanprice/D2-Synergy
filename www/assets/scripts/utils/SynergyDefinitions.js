
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
    EDZ: 697502628,
    Nessus: 3607432451,
    TangledShore: 3821439926,
    DreamingCity: 1416096592,
    Moon: 677774031,
    Europa: 1729879943,
    Cosmodrome: 3990611421, // 6
};

// Hashes for activity modes
const ActivityModeHash = {
    gambit: 1848252830,
    strike: 2394616003,
    nightfall: 3789021730,
    crucible: 1164760504,
    mayhem: 1264443021,
    control: 3199098480,
    breakthrough: 4033000329,
    countdown: 1505888634,
    elimination: 4078439804,
    doubles: 3821502017,
    supremacy: 910991990,
    rumble: 157639802,
    survival: 2239249083,
    ironBanner: 1826469369,
    dungeon: 608898761,
    nightmareHunt: 332181804,
    story: 1686739444,
    trials: 1673724806,
    explore: 3497767639,
    daresOfEternity: 2294590554,
    raid: 2043403989, // 20
};

// Hashes for damage type
const DamageTypeHash = {
    Solar: 1847026933,
    Arc: 2303181850,
    Kinetic: 3373582085,
    Void: 3454344768,
    Stasis: 151347233, // 4
};

// Strings for weapon type
const ItemCategory = [
    'Auto Rifle',
    'Scout Rifle',
    'Pulse Rifle',
    'Hand Cannon',
    'Shotgun',
    'Grenade Launcher',
    'Rocket Launcher',
    'Sniper Rifle',
    'Sword',
    'Linear Fusion Rifle',
    'Fusion Rifle',
    'Glaive',
    'Submachine Gun',
    'Machine Gun',
    'Trace Rifle',
    'Sidearms',
    'Bow', // 16
];

// Hashes for weapon ammuniation type
const ItemType = [
    'Special Ammo',
    'Primary Ammo',
    'Heavy Ammo', // 3
];

// Strings for kill type
const KillType = [
    'Melee',
    'Super',
    'Grenade',
    'Finisher',
    'Precision',
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
  ItemType,
  ItemCategory,
  KillType,
};