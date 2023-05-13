import {
    ActivityMode,
    DamageType,
    ItemCategory,
    KillType,
    EnemyType } from './SynergyDefinitions.js';
import { AddTableRow } from './AddTableRow.js';
import { ParsePropertyNameIntoWord } from './ParsePropertyNameIntoWord.js';


/*

    - Store relations table data
    - Clear the relations table
    - Build the relations table whilst:
        1.) Keeping user input in mind; toggles
        2.) Format data to emit a clean output that is readable and effective
        Note: This data should be made global

*/

// Relations table metadata
export var relationsTable = {

    // DOM element
    div: {},

    // Specific to current character
    relations: {
        bounties: {},
        challenges: {},
        all: {}
    },

    // UI toggles
    toggles: {
        pvp: true,
        pve: true,
        challenges: true,
        expiredBounties: true,
        earnedChallenges: true, // earned but not claimed
    },

    // Clear (and rebuilt header row) table
    ClearTable: function() {
        
        // Clear relations table
        this.div.innerHTML = '';
        this.div.innerHTML = '<tr><th>Keyword</th><th>Relation</th></tr>';

        let ctgs = ['ActivityMode', 'ItemCategory', 'DamageType', 'KillType', 'EnemyType'];

        // Clear relation squares
        for (let item of ctgs) {
            document.getElementById(`${item}Title`).className = 'relationSquareNormal';
            document.getElementById(`${item}Arrow`).src = './static/ico/neutral_ring.svg';
            document.getElementById(`${item}Arrow`).classList.remove('greenIco');
            document.getElementById(`${item}Text`).innerHTML = '--';
        };
    },

    // Build table and store all metadata
    BuildTable: function() {

        // Find the average relation points
        function findAverage(typeString, item) {
            if (item[1] > averageRelationCount) {
                document.getElementById(`${typeString}Title`).className = 'relationSquareGreen';
                document.getElementById(`${typeString}Arrow`).src = './static/ico/blackArrow.svg';
                document.getElementById(`${typeString}Arrow`).classList.add('greenIco');
            }
            else if (item[1] < averageRelationCount) {
                document.getElementById(`${typeString}Title`).className = 'relationSquareOrange';
                document.getElementById(`${typeString}Arrow`).src = './static/ico/orangeArrow.svg';
                document.getElementById(`${typeString}Arrow`).classList.remove('greenIco');
            };
            
            // Change the average up/down green/orange arrow based on the average relation count
            document.getElementById(`${typeString}Text`).innerHTML = item[0];
        };

        // Clear table first and init
        this.ClearTable();
        let totalRelationCount = 0;
        let totalItemCount = 0;
        let averageRelationCount = this.relations.averageRelationCount;

        // Iterate over all relations
        Object.keys(this.relations.all).forEach((relation) => {


            // Check if challenges are toggled
            if (!this.toggles.challenges) {

                // Loop over challenges and subtract each challenges' key value from relations.all
                Object.keys(this.relations.challenges).forEach((challengeRelation) => {
                    if (this.relations.challenges[challengeRelation][0] === this.relations.all[relation][0]) {
                        this.relations.all[relation][1] -= this.relations.challenges[challengeRelation][1];
                    };
                });
            };

            // Check if properties have a value of zero, if so then omit
            if (this.relations.all[relation][1] === 0) {
                delete this.relations.all[relation];
            };
        });

        // Rebuild relations.all objects
        this.relations.all = Object.entries(this.relations.all).map(([key, value]) => value);

        // Sort relations.all via relationCount and descending order, before pushing rows to table
        this.relations.all = Object.values(this.relations.all).sort((a,b) => b[1] - a[1]);


        // Check if there are no relations -- show/hide corresponding content
        if (Object.keys(this.relations.all).length === 0) {
            document.getElementById('noRelationsExistElement').style.display = 'block';
            document.getElementById('tblCon').style.display = 'none';
            document.getElementById('relationsTotalField').innerHTML = '0';
            return;
        }
        else {
            document.getElementById('noRelationsExistElement').style.display = 'none';
            document.getElementById('tblCon').style.display = 'block';
        };

        // Iterate over all relations again (after keys are removed otherwise emits undefined)
        Object.keys(this.relations.all).forEach((a) => {

            let itemName = this.relations.all[a][0];
            let itemRelationCount = this.relations.all[a][1];

            // Add property value to relation count
            totalRelationCount += this.relations.all[a][1];

            // Increment item count
            totalItemCount++;

            // Add table row with item data
            AddTableRow(this.div, [itemName, `${itemRelationCount}pts`]);
        });

        // When table rows do not fill 100% height, fill difference with empty rows
        if (totalItemCount < 10) {
            let requiredRows = 20 - totalItemCount; // 10 is the max rows before overflow occurs
            for (let i=0; i<requiredRows; i++) {
                AddTableRow(this.div, ['', '']);
            };
        };

        // Update table subheading relation count
        document.getElementById('relationsTotalField').innerHTML = `${totalRelationCount}`;

        let highestActivityMode; // e.g. strikes
        let highestItemCategory; // e.g. scout rifle
        let highestDamageType; // e.g. void damage
        let highestKillType; // e.g. precision kills
        let highestEnemyType; // e.g. bosses/guardians

        // Find the highest relation from each category
        // allRelations is sorted so it should find the first match
        this.relations.all.forEach(item => {
            
            let name = ParsePropertyNameIntoWord(item[0], true);

            if (ActivityMode.includes(name)) {
                if (!highestActivityMode) {
                    highestActivityMode = name;
                    findAverage('ActivityMode', item);
                };
            }
            else if (ItemCategory.includes(name)) {
                if (!highestItemCategory) {
                    highestItemCategory = name;
                    findAverage('ItemCategory', item);
                };
            }
            else if (DamageType.includes(name)) {
                if (!highestDamageType) {
                    highestDamageType = name;
                    findAverage('DamageType', item);
                };
            }
            else if (KillType.includes(name)) {
                if (!highestKillType) {
                    highestKillType = name;
                    findAverage('KillType', item);
                };
            }
            else if (EnemyType.includes(name)) {
                if (!highestEnemyType) {
                    highestEnemyType = name;
                    findAverage('EnemyType', item);
                };
            };
        });
    }
};