

export function vectorToAngle(dx,dy) {

    var angle = undefined;

    if (dx != 0 || dy != 0) {

        if (dx == 0) {

            if (dy > 0) {
                angle = Math.PI;
            } else {
                angle = 0;
            }
        } else if (dy == 0) {

            if (dx > 0) {
                angle = 0.5 * Math.PI;
            } else {
                angle = 1.5 * Math.PI;
            }
        } else {
            angle = Math.atan(dx / dy) * -1;

            if (Math.sign(dy) == 1) {
                angle += Math.PI;
            } else if (Math.sign(dy) == -1) {
                angle += 2* Math.PI;
            }
            
        }

    }

    return checkAngle(angle);
}

export function angleToVector(angle, distance) {

    var angle = checkAngle(angle);
    var dx = 0;
    var dy = 0;


    if (angle != undefined && distance != 0) {
        if (angle == 0) {
            dy = -1 * distance;
            dx = 0;
        } else if (angle == Math.PI){
            dy = distance
            dx = 0;

        } else if (angle == Math.PI * 0.5){
            dx = distance;
            dy = 0;

        } else if (angle == Math.PI * 1.5){
            dx = distance * -1;
            dy = 0;

        } else {
            dx = distance * Math.sin(angle);
            dy = -1 * distance * Math.cos(angle);
        }
    }


    return {'dx': dx, 'dy': dy}
}

export function checkAngle(angle) {

    if (angle >= 2 * Math.PI) {

        angle -= (Math.PI * 2 * Math.floor(angle/(Math.PI * 2)))
    }

    if (angle < 0) {
        angle += (Math.PI * 2 * (Math.floor(Math.abs(angle/(Math.PI * 2)) + 1)))
    }

    return angle;
    
}

export function dist(x1, y1, x2, y2) {

    return Math.sqrt(((x2 - x1)**2) + ((y2 - y1)**2))
}

export function angleBetween(angle1, angle2) {

    var diff = angle1 - angle2

    var sign = Math.sign(diff);
    var angle = Math.abs(diff);

    if (angle > Math.PI) {
        angle = (2* Math.PI) - angle;
        sign *= -1
    }


    return {'angle':angle, 'sign':sign}
}

export function angleRange(distance, travel, gap) {

    var retreatAngle = 0.1;

    var angle = 0;

    if (travel > distance - gap && travel < distance + gap && distance > gap) {
        
        var value = ((distance ** 2) + (travel ** 2) - (gap ** 2))/(2 * distance * travel);
        angle = Math.abs(Math.acos(value));
    
    } else if (distance <= gap) {

        angle = (Math.PI / 2) + (Math.PI* retreatAngle);
    }


    return angle
}
