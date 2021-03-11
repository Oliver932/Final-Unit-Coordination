import {dist, checkAngle, vectorToAngle, angleBetween, angleRange, angleToVector} from './vectorFunctions.js';
import {unitNames, unitTypes} from './unitData.js';
import {scale, offset, frame} from './Settings.js';

export default function smartTarget(item, units) {

    var angle = undefined;

    var target = getClosest(item, units);

    if (target != undefined) {
        var dx = target.x - item.x;
        var dy = target.y - item.y;

        angle = retreatCheck(item, vectorToAngle(dx, dy));
        angle = changeCurrentAngle(item, angle);
    }

    item.currentAngle = angle;

    return angle;


}

function changeCurrentAngle(item, angle) {

    if (item.currentAngle != undefined && item.currentAngle != angle){

        var turningVelocity = (unitTypes[item.type].behaviour.turningVelocity /(100 * frame)) * Math.PI * 2;
        var fullAngle = angleBetween(angle, item.currentAngle);

        if (fullAngle.angle > turningVelocity) {
            angle = item.currentAngle + (fullAngle.sign * turningVelocity);
        } 
    }

    return angle
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


