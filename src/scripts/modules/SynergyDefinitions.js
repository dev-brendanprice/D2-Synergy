
// Hashes for destinations
export const DestinationHash = {
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
export const ActivityModeHash = {
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
export const DamageTypeHash = {
    Solar: 1847026933, //0
    Arc: 2303181850, //1
    Kinetic: 3373582085, //2
    Void: 3454344768, //3
    Stasis: 151347233, // 4
};

// XP Buffs
export const XpBuffs = {
    2457096233: '10'
};

// XP Buffs by Season Rank
export const SeasonRankXpModifiers = {
    2319209868: {modifier: '100', ranks: 7},
    2352765282: {modifier: '100', ranks: 5}
};

// Implicit XP Buffs
export const XpBonusTitles = {
    534860348: 'XP Boost',
    582107389: 'Wisdom',
    2656018541: 'Welcoming Party',
    2775994369: 'Bright Paragon'
};

// XP Buffs by Destination
export const DestinationXpModifiers = {
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
export const ActivityXpModifiers = {
    329782251: '10',
    1357892657: '10',
    3255802493: '10'
};

// XP Buffs from mods on ghost
export const GhostXpMods = {
    3292232288: '5',
    3292232289: '8',
    3292232290: '2',
    3292232291: '3',
    3292232294: '10',
    3292232295: '12'
};

// Seasonal challenge completion rewards
// Corresponding bright dust values
export const rewardsBasedOnChallengerXP = {
    'Challenger XP': 0,
    'Challenger XP+': 75,
    'Challenger XP++': 150,
    'Challenger XP+++': 300
};
export const rewardsBasedOnSingularItems = {
    'Challenger XP': 25_000,
    'Challenger XP+': 50_000,
    'Challenger XP++': 100_000,
    'Challenger XP+++': 200_000,
    'Large Bright Dust Pile': 4000,
    'War Table Upgrade': 1,
    'Trials of Osiris Weapon': 1
};

// Bounty type
export const itemTypeKeys = [
    'weekly',
    'daily',
    'repeatable'
];

// Normal XP gains
export const baseYields = {
    'weekly': 12_000,
    'daily': 6_000,
    'repeatable': 4_000
};

// Petra Venj XP gains
export const petraYields = {
    'weekly': 6_000,
    'daily': 1_000,
    'repeatable': 0
};

// Vendor groups
export const vendorKeys = [
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
    'star_chart',
    'other'
];

// Vendors by their corresponding substring of the stackUniqueLabel
export const VendorHashesByLabel = {
    'gunsmith': 672118013, // Banshee-44
    'transmog': 350061650, // Ada-1
    'strikes': 69482069, // Zavala
    'crucible': 3603221665, // Lord Shaxx
    'gambit': 248695599, // Drifter
    'season18': 518338309, // Star Chart
    'edz': 396892126, // Devrim Kay
    'cosmodrome': 1816541247, // Shaw Han
    'myriad': 1576276905, // Failsafe
    'public_loop': 1616085565, // Eris Morn
    'clan': 3347378076, // Hawthorne
    'trials': 765357505, // Saint-14
    'europa': 2531198101, // Variks
    'dreaming_city': 1841717884, // Petra Venj
    'nightmare': 3411552308, // Lectern of Enchantment
    'season17': 2748388973, // Crown of Sorrow
    'throneworld': 2384113223, // Fynch
    'dare_cards': 3431983428, // Starhorse (still contains 'xur')
    'eternity': 3442679730, // Xur
    'fotl': 919809084, // Festival of the Lost (fotl)
};

// eternity.bounties.xur.dare_cards.legendary.bounty06
// eternity.bounties.xur.daily.bounty15

// Currently added vendors with hashes
export const CurrentlyAddedVendors = {
    'None': null,
};

// Progression item group types
export const progressionItemGroupTypes = [
    'Crucible', //0
    'Vanguard', //1
    'Gambit', //3
];

// Add specifiers for seperating PvP specific properties
export const pvpActivityModes = [
    'Crucible', //0
    'Mayhem', //1
    'Control', //2
    'Breakthrough', //3
    'Countdown', //3
    'Elimination', //4
    'Doubles', //5
    'Supremacy', //6
    'Rumble', //7
    'Survival', //8
    'IronBanner', //9
    'Trials', //10
    'Clash', //11
    'Momentum', //12
    'Scorched', //13
    'Lockdown', //14
    'Showdown', //15
];

// Add specifiers for seperating PvE specific properties
export const pveActivityModes = [
    'Gambit', //0
    'Strike', //1
    'Nightfall', //2
    'Dungeon', //3
    'NightmareHunt', //4
    'Story', //5
    'Explore', //6
    'DofE', //7 - Dares of Eternity
    'Raid', //8
    'EmpireHunt', //9
    'Expedition', //10
    'Vanguard', //11
    'Battlegrounds', //12
];

// Add specified for vanguard activities
export const vanguardActivityModes = [
    'Strike', //0
    'Nightfall', //1
];

// Strings for kill type
export const weaponSpecificKillTypes = [
    'Precision', //4
    'CloseRange', //6
    'RapidKills', //7
    'NoReload', //8
    'GuardianKills', //9
    'InASingleLife' //10
];

// Hashes for destinations
export const Destination = [
    'EDZ', //0
    'Nessus', //1
    'TangledShore', //2
    'DreamingCity', //3
    'Moon', //4
    'Europa', //5
    'Cosmodrome', //6
    'Throne World', //7
    'Neomuna', //8
];

// Hashes for activity modes
export const ActivityMode = [
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
    'DaresOfEternity', //19 - Dares of Eternity
    'Raid', //20
    'Clash', //21
    'Momentum', //22
    'Scorched', //23
    'Lockdown', //24
    'Showdown', //25
    'EmpireHunt', //26
    'Expedition', //27
    'KetchCrash', //28
    'HeistBattleground', //29
    'Vanguard', //30
    'DefiantBattleground', //31
    'TerminalOverload', //32
    'VexIncursionZone', //33
];

// Damage types
export const DamageType = [
    'Solar', //0
    'Arc', //1
    'Kinetic', //2
    'Void', //3
    'Stasis', //4
    'Strand', //5
];

// Weapon types
export const ItemCategory = [
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
    'Bow', //16
];

// Ammunition types
export const AmmoType = [
    'PrimaryAmmo', //0
    'SpecialAmmo', //1
    'HeavyAmmo', //2
];

// Kill types
export const KillType = [
    'Melee', //0
    'Super', //1
    'Grenade', //2
    'Finishers', //3
    'Precision', //4
    'ClassAbility', //5
    'CloseRange', //6
    'Rapidly', //7
    'NoReload', //8
    'Guardian', //10
    'InASingleLife', //11
    'LongRange', //12
    'Abilities', //13
    'Orbs', //14
];

// Enemy types
export const EnemyType = [
    'Vex', //0
    'Fallen', //1
    'Hive', //2
    'Taken', //3
    'Cabal', //4
    'Scorn', //5
];

// Enemy Modifiers
export const EnemyModifiers = [
    'Champions', //0
    'Nightmares', //1
    'Powerful', //2
    'Bosses', //3
    'Boss', //4
];

// Seasonal Categories via Name
export const SeasonalCategory = [
    'SeasonOfTheSeraph', //0
    'SeasonOfPlunder', //1
    'SeasonOfTheHaunted', //2
    'SeasonOfTheDefiance', //3
];

// Location Specifics
export const LocationSpecifics = [
    'AnchorOfLight', //0
    'ArchersLine', //1
    'Hellmouth', //2
    "Sorrow's Harbor", //3
    'Sancutary', //4
    'Divilian Mists', //5
    'The Strand', //6
    'Rheasilvia', //7
    'Trostland', //8
    'The Sludge', //9
    'The Gulch', //10
    'Outskirts', //11
    'Winding Cove', //12
    'Firebase Hades', //13
    'Sunken Isles', //14
    'Quagmire', //15
    'Floresecent Canal', //16
    'Miasma', //17
    'Asterion Abyss', //18
    'Cadmus Ridge', //19
    'Eventide Ruins', //20
    'The Cistern', //21
    "Artifact's Edge", //22
    'Glade of Echoes', //23
    'Exodus Black', //24
    'The Tangle', //25
    "Watcher's Grave", //26
    'Mothyards', //27
    'The Steppes', //28
    'Forgotten Shore', //29
    'Skywatch', //30
];

// Descriptor Specifics
export const DescriptorSpecifics = [
    'LostSectors', //0
    'PowerfulEnemies', //1
    'LucentHive', //2
    'OrbsOfPower', //3
    'Clanmates', //4
    'Bosses', //5
    'Orbs', //6
];
