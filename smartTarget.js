import {dist, checkAngle, vectorToAngle, angleBetween, angleRange, angleToVector} from './vectorFunctions.js';


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

    for (const team in units) {
        if (Object.hasOwnProperty.call(units, team)) {

            if (team != item.team) {

                for (let i = 0; i < units[team].length; i++) {

                    var object = units[team][i];

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


// function chooseTarget() {

//     var xA = 0;
//     var xR = 0;

//     var yA = 0;
//     var yR = 0;

//     var tA = 0;
//     var tR = 0;


//     var accentuate = 12;

//     for (const team in units) {
//         if (Object.hasOwnProperty.call(units, team)) {



//             for (let i = 0; i < units[team].length; i++) {

//                 // console.log('a', x, y);

//                 var opponent = units[team][i];

//                 if (this != opponent) {

//                     var distance = this.distance(opponent.x, opponent.y);

//                     var xMultiplier = Math.sign(opponent.x - this.x);
//                     var yMultiplier = Math.sign(opponent.y - this.y);



//                     var gap = opponent.size + this.size + offset;


//                     if (opponent.team != this.team && distance >= gap) {
//                         gap += this.behaviour.range * this.size
//                     }

//                     var distFunc = Math.sin(1 / (accentuate * ((distance - gap) / diagonal)));
//                     if (distFunc < 0) {
//                         distFunc *= -1;
//                     }
//                     // var responsiveness = 10;
//                     // var distFunc = 1/(Math.sqrt(Math.sqrt(distance)) + responsiveness);


//                     if (distFunc > 0) {

//                         var xRatio = Math.abs((opponent.x - this.x) / (Math.abs(opponent.y - this.y) + Math.abs(opponent.x - this.x)));
//                         var yRatio = 1 - xRatio;

//                         var engaged = 1

//                         if (opponent.status == 'engaged') {

//                             engaged = opponent.enemies.length * this.behaviour.group;
//                         }

//                         var mRatio = this.moraleRatio;

//                         // var mMultiplier = (mRatio * this.behaviour.sensitivity) ** this.behaviour.power;



//                         if (this.mStatus != 'routed' && this.mStatuses != 'retreating' && team != this.team) {


//                             var dxA = distFunc * xMultiplier * xRatio / (engaged);
//                             var dyA = distFunc * yMultiplier * yRatio / (engaged);

//                             var flankD = this.flank(opponent, dxA, dyA);



//                             xA += flankD.dx
//                             yA += flankD.dy
//                             tA += distFunc;
//                             // console.log(1 ,x, y, xRatio, yRatio, distFunc, distance);

//                         } else if (team != this.team) {

//                             var dxR = distFunc * xMultiplier * xRatio / (engaged);
//                             var dyR = distFunc * yMultiplier * yRatio / (engaged);

//                             xR -= dxR
//                             yR -= dyR
//                             tR += distFunc;
//                             // console.log(2, x, y);


//                         }

//                     }
//                 }

//             }


//         }
//     }

//     x = xA + xR;
//     y = yA + yR;


//     x *= (Math.random() + 0.5)
//     y *= (Math.random() + 0.5)

//     var angle = vectorToAngle(x, y);


//     return angle

// }

// function flank(opponent, dx, dy) {

//         var flankD = { 'dx': dx, 'dy': dy };
//         var xDistance = opponent.x - this.x;
//         var yDistance = opponent.y - this.y;

//         if (this.behaviour.flanking == true && yDistance != 0) {

//             var flanking = this.size * 2 * this.behaviour.flankDist;
//             var flankAngle = Math.PI / (2 * this.behaviour.flankAngle);
//             var overshoot = 0;

//             var xMultiplier = 1;
//             if (this.team == 'Hazza') {
//                 xMultiplier = -1;
//             }


//             var infront = Math.sign(xDistance + (overshoot * xMultiplier)) * xMultiplier;
//             var iAngle = vectorToAngle(dx, dy);

//             if (infront == 1 && Math.abs(yDistance) < flanking) {
//                 iAngle += flankAngle * Math.sign(yDistance) * xMultiplier * -1;
//             }

//             flankD = angleToVector(iAngle, this.mStatuses[this.mStatus].speed);

//         }

//         return flankD;
//     }
