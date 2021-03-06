import {dist, checkAngle, vectorToAngle, angleBetween, angleRange, angleToVector} from './vectorFunctions.js';
import {unitNames, unitTypes} from './unitData.js';
import {scale, offset} from './Settings.js';

// item and individual units require size, x, y, behaviour.range, status, orientation and team properties
// item and individual units must also have .delete method
// modifies angle and travel to ensure both collision avoidance and range retention, moves unit and updates screen

export default function smartMove(item, travel, travelAngle, units) {

    if (travelAngle != undefined) {


        var objects = withinRange(item, units);

        // var directions = ['CW', 'ACW'];
        // var direction = directions[Math.round(Math.random())];

        var direction = 'CW';

        if ((travelAngle >= Math.PI * 0.5 && travelAngle < Math.PI * 1) || (travelAngle <= Math.PI * 2 && travelAngle > Math.PI * 1.5)){
            direction = 'ACW';
        }

        var angleAdjustment = 0;
        var angle = travelAngle;
        var newTravel = travel;

        if (objects.length > 0) {
            var resolve = false;


            while (Math.abs(angleAdjustment) < Math.PI * 2 && resolve == false) {


                var data = moderateAngle(item, travel, angle, objects, false, direction);


                angleAdjustment += data.angleAdjustment;

                if (data.repeat == false || data.angleAdjustment == 0) {
                    resolve = true
                    break;
                }

                angle = checkAngle(angle + data.angleAdjustment);
            }


            if (resolve == false) {

                angleAdjustment = 0;

                while (Math.abs(angleAdjustment) < Math.PI * 2 && resolve == false) {


                    var data = moderateAngle(item, travel, angle, objects, true, direction);


                    angleAdjustment += data.angleAdjustment;

                    if (data.repeat == false || data.angleAdjustment == 0) {
                        resolve = true;
                        newTravel = data.travel;
                        break;
                    }

                    angle = checkAngle(angle + data.angleAdjustment);
                }
            }

            if (resolve == false) {
                newTravel = 0;
            }

        }

        doMove(item, angle, newTravel);
        edgeCheck(item);

    } else {
        item.status = 'static';
    }

}

function moderateAngle(item, travel, travelAngle, objects, restrict, direction){

    var angleAdjustment = 0;
    var newTravel = travel;
    var repeat = false;

    if (objects.length > 0) {
        for (let index = 0; index < objects.length; index++) {
            const obj = objects[index];

            var gap = item.size + offset + obj.size;

            if (item.team != obj.team) {
                gap += (unitTypes[item.type].behaviour.range * item.size);
            }

            var data = obstacleData(item.x, item.y, obj.x, obj.y, travel, travelAngle, gap);

            if (restrict == false) {

                if (Math.abs(data.adjustment[direction]) > Math.abs(angleAdjustment)) {

                    angleAdjustment = data.adjustment[direction];
                    // console.log('A', data.adjustment[direction])
                    repeat = true;

                }

            } else if (data.overlap == false){
                
                if (data.travel < newTravel) {
                    newTravel = data.travel;

                }


            } else {

                if (Math.abs(data.adjustment[direction]) > Math.abs(angleAdjustment)) {

                    angleAdjustment = data.adjustment[direction];
                    repeat = true;

                }
            }


            
        }
    }

    return {'angleAdjustment':angleAdjustment, 'travel':newTravel, 'repeat':repeat, 'data': data}
}

function obstacleData(x1, y1, x2, y2, travel, travelAngle, gap){

    var direction = 'towards';
    var overlap = false;
    var adjustment = {'CW':0, 'ACW':0};

    var distance = dist(x1, y1, x2, y2);
    var requiredOvershoot = angleRange(distance, travel, gap);


    var dx = x2 - x1;
    var dy = y2 - y1;

    var actualAngle = vectorToAngle(dx, dy);

    var aB = angleBetween(travelAngle, actualAngle);
    var actualOvershoot = aB.angle;
    var sign = aB.sign;

    if (actualOvershoot == Math.PI){
        direction = 'opposite';

    } else if (actualOvershoot > Math.PI / 2) {
        direction = 'away';
    
    } else if (actualOvershoot == Math.PI / 2) {
        direction = 'perpendicular';
    
    } else if (actualOvershoot == 0) {
        direction = 'direct';
    }

    if (actualOvershoot < requiredOvershoot) {

        travel = allowedDistance(distance, actualOvershoot, gap)

        if (sign == -1) {
            adjustment = {'CW':actualOvershoot + requiredOvershoot + 0.01, 'ACW':(requiredOvershoot - actualOvershoot + 0.01) * -1}
        } else {
            adjustment = {'CW':requiredOvershoot - actualOvershoot + 0.01, 'ACW':(requiredOvershoot + actualOvershoot + 0.01) * -1}
        }


    } 
    
    if (distance < gap) {

        overlap = true;
    }

;


    return {'travel':travel, 'overshoot':requiredOvershoot, 'distance':distance, 'angleDiff':actualOvershoot * sign, 'actualAngle':actualAngle, 'direction':direction, 'overlap':overlap, 'adjustment':adjustment};
}

function allowedDistance(distance, angle, gap){

    var travel = 0;

    if (distance > gap){

        if (angle != Math.PI && angle != 0) {

            var b = -2 * distance * Math.cos(angle);
            var c = (distance ** 2) - (gap ** 2);

            var discriminant = (b ** 2) - (4 * c);

            if (discriminant >= 0) {
                travel = ((b * -1) - Math.sqrt(discriminant)) / 2;
            }


        } else if (angle == 0) {
            travel = distance - gap;
        
        } 
    }

    return travel;
}

function doMove(item, angle, travel) {

    var vector = angleToVector(angle, travel);

    var dx = vector.dx;
    var dy = vector.dy;

    if (dy == 0 && dx == 0 && item.status != 'engaged') {
        item.status = 'static';
    } else if (item.status != 'engaged') {
        item.status = 'moving';

        if (Math.abs(dx) > unitTypes[item.type].mStatuses.retreating.speed) {
            if (Math.sign(dx) == -1) {
                item.orientation = 'L';
            } else {
                item.orientation = 'R';
            }
        }
    }

    item.x += dx
    item.y += dy

    item.lastMove = travel;
    

}

function withinRange(item, units){


    var obstructions = [];

    for (let i = 0; i < units.length; i++) {

        var opponent = units[i];

        var gap = opponent.size + item.size + offset;

        if (opponent.team != item.team) {
            gap += unitTypes[item.type].behaviour.range * item.size
        }




        if (item != opponent) {

            var distance = dist(item.x, item.y, opponent.x, opponent.y);

            if (distance - gap <= unitTypes[item.type].mStatuses[item.mStatus].speed) {
                obstructions.push(opponent);
            }
        }

    }
    return obstructions;

    }

function edgeCheck(item) {

    if ((item.x < 0 || item.y < 0 || item.x > innerWidth || item.y > innerHeight) && (item.mStatus == 'retreating' || item.mStatus == 'routed')) {
        item.delete();
    }
}