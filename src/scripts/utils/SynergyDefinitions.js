
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

// XP Buffs
const XpBuffs = {
    2457096233: '10'
};

// XP Buffs by Season Rank
const SeasonRankXpModifiers = {
    2319209868: {modifier: '100', ranks: 7},
    2352765282: {modifier: '100', ranks: 5}
};

// Implicit XP Buffs
const ImpXpBuffs = {
    534860348: 'XP Boost',
    582107389: 'Wisdom',
    2656018541: 'Welcoming Party',
    2775994369: 'Bright Paragon'
};

// XP Buffs by Destination
const DestinationXpModifiers = {
    4146504890: '10',
    3404518646: '10',
    3275051284: '10',
    2489071480: '10',
    1990928495: '10',
    1933479768: '10',
    1894263102: '10',
    1432122667: '10',
    1064347710: '10'
};

// XP Buffs by Activity
const ActivityXpModifiers = {
    329782251: '10',
    1357892657: '10',
    3255802493: '10'
};

// XP Buffs from mods on ghost
const GhostXpMods = {
    3292232288: '5',
    3292232289: '8',
    3292232290: '2',
    3292232291: '3',
    3292232294: '10',
    3292232295: '12'
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
    showdown: 1457072306, // 25
    empireHunt: 494260690 // 26
};

// Hashes for damage type
const DamageTypeHash = {
    Solar: 1847026933, //0
    Arc: 2303181850, //1
    Kinetic: 3373582085, //2
    Void: 3454344768, //3
    Stasis: 151347233, // 4
};

// Hashes for destinations
const Destination = [
    'EDZ', //0
    'Nessus', //1
    'TangledShore', //2
    'DreamingCity', //3
    'Moon', //4
    'Europa', //5
    'Cosmodrome', // 6
    'Throneworld', // 7
];

// Hashes for activity modes
const ActivityMode = [
    'Gambit', //0
    'Strike', //1
    'Nightfall', //2
    'Crucible', //3
    'Mayhem', //4
    'Control', //5
    'Breakthrough', //6
    'Countdown', //7
    'Elimination', //8
    'Doubles', //9
    'Supremacy', //10
    'Rumble', //11
    'Survival', //12
    'IronBanner', //13
    'Dungeon', //14
    'NightmareHunt', //15
    'Story', //16
    'Trials', //17
    'Explore', //18
    'DofE', //19
    'Raid', // 20
    'Clash', //21
    'Momentum', //22
    'Scorched', //23
    'Lockdown', //24
    'Showdown', // 25
    'EmpireHunt', // 26
];

// Hashes for damage type
const DamageType = [
    'Solar', //0
    'Arc', //1
    'Kinetic', //2
    'Void', //3
    'Stasis', // 4
];

// Strings for weapon type
const ItemCategory = [
    'AutoRifle', //0
    'ScoutRifle', //1
    'PulseRifle', //2
    'HandCannon', //3
    'Shotgun', //4
    'GrenadeLauncher', //5
    'RocketLauncher', //6
    'SniperRifle', //7
    'Sword', //8
    'LinearFusionRifle', //9
    'FusionRifle', //10
    'Glaive', //11
    'SubmachineGun', //12
    'MachineGun', //13
    'TraceRifle', //14
    'Sidearm', //15
    'Bow', // 16
];

// Hashes for weapon ammuniation type
const AmmoType = [
    'PrimaryAmmo', //0
    'SpecialAmmo', //1
    'HeavyAmmo', // 2
];

// Strings for kill type
const KillType = [
    'Melee', //0
    'Super', //1
    'Grenade', //2
    'Finisher', //3
    'Precision', //4
    'ClassAbility', // 5
    'CloseRange', // 6
    'RapidKills', // 7
    'NoReload', // 8
    'GuardianKills' // 9
];

// Race type signifer ??
// "As a fireteam" signifier ??
// "With clan" signifier ??

// Make a bucket system to easily apply properties to a selection of bounties all at once

// Weight bounties with bonus progress modifiers (Gaurdians are worth more etc)


export {
  itemTypeKeys,
  vendorKeys,
  baseYields,
  petraYields,
  ActivityMode,
  Destination,
  DamageType,
  AmmoType,
  ItemCategory,
  KillType,
};