import {dist} from './vectorFunctions.js';

export default function smartMorale (item, units, offset) {

    var attraction = 1;
    var repulsion = 1;


    for (const team in units) {
        if (Object.hasOwnProperty.call(units, team)) {

            for (let i = 0; i < units[team].length; i++) {

                var object = units[team][i];

                if (object != item) {

                    var moraleModifier = calculateMorale(item, object, offset);

                    if (team == item.team) {

                        attraction += moraleModifier;
                        
                    } else {

                        repulsion += moraleModifier;
                    }
                }
            }
        }
    }

    item.moraleRatio = (attraction / repulsion) * (item.morale / item.baseMorale);


    calculateMStatus(item);

}

function calculateMStatus(item) {

    item.mStatus = 'charging';
    
    if (item.moraleRatio < item.mStatuses.charging.morale) {

        item.mStatus = 'advancing';

        if (item.moraleRatio < item.mStatuses.advancing.morale) {

            item.mStatus = 'retreating';

            if (item.moraleRatio < item.mStatuses.retreating.morale) {

                item.mStatus = 'routed';
            }
        }
    }
}

function calculateMorale(item, object, offset) {

    var distance = dist(item.x, item.y, object.x, object.y);

    var distFunc = (offset + item.size + object.size) / (distance);

    return distFunc * object.morale;
}