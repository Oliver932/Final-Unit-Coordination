import {dist, checkAngle, vectorToAngle, angleBetween, angleRange, angleToVector} from './vectorFunctions.js';
import {unitNames, unitTypes} from './unitData.js';

export default function smartTarget(item, units) {

    var angle = undefined;

    var target = getClosest(item, units);

    if (target != undefined) {
        var dx = target.x - item.x;
        var dy = target.y - item.y;

        angle = retreatCheck(item, vectorToAngle(dx, dy));
    }

    return angle;


}

function getClosest(item, units) {

    var closest = undefined;
    var distance = undefined;


    for (let i = 0; i < units.length; i++) {

        var object = units[i];

        if (object.team != item.team) {

            var newDist = dist(item.x, item.y, object.x, object.y);

            if (closest == undefined) {
                closest = object;
                distance = newDist;

            } else if (newDist < distance){

                closest = object;
                distance = newDist;
            }
        }
    }

    return closest
}

function retreatCheck(item, angle) {

    if (item.mStatus == 'retreating' || item.mStatus == 'routed') {

        angle = checkAngle(angle + Math.PI);
    }

    return angle;
}


