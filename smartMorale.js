import {dist} from './vectorFunctions.js';
import {unitNames, unitTypes} from './unitData.js';
import {scale, offset} from './Settings.js';

export default function smartMorale (item, units) {

    var modifier = 2;

    var attraction = 1;
    var repulsion = 1;

    for (let i = 0; i < units.length; i++) {

        var object = units[i];

        if (object != item) {

            var moraleModifier = calculateMorale(item, object);

            if (object.team == item.team) {

                attraction += moraleModifier;
                
            } else {

                repulsion += moraleModifier;
            }
        }
    }

    var potentialMorale = (item.morale / unitTypes[item.type].mMax);
    item.moraleRatio = (attraction / repulsion) * potentialMorale * modifier;


    calculateMStatus(item);

}

function calculateMStatus(item) {

    item.mStatus = 'charging';
    
    if (item.moraleRatio < unitTypes[item.type].mStatuses.charging.morale) {

        item.mStatus = 'advancing';

        if (item.moraleRatio < unitTypes[item.type].mStatuses.advancing.morale) {

            item.mStatus = 'retreating';

            if (item.moraleRatio < unitTypes[item.type].mStatuses.retreating.morale) {

                item.mStatus = 'routed';
            }
        }
    }
}

function calculateMorale(item, object) {

    var distance = dist(item.x, item.y, object.x, object.y);

    var distFunc = (offset + item.size + object.size) / (distance);

    return distFunc * object.morale;
}