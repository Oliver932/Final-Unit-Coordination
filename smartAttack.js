import {dist, checkAngle, vectorToAngle, angleBetween, angleRange, angleToVector} from './vectorFunctions.js';

//units and item must have an enemies.inrange and enemies.outofrange lists
//deals damage to morale and health, manages unit attack preferences

export default function smartAttack(item, units, offset) {

    item.enemies = []
    item.status = 'moving';


    if (item.mStatus != 'routed') {

        addRange(item, units, offset);
    }

    dealDamage(item);
    item.draw();
}

function addRange(item, units, offset) {

    


    for (const team in units) {
        if (Object.hasOwnProperty.call(units, team)) {

            for (let i = 0; i < units[team].length; i++) {

                var enemy = units[team][i];

                if (item.team != enemy.team) {

                    var rangeMultiplier = 1.2

                    var distance = dist(item.x, item.y, enemy.x, enemy.y)
                    var maxRange = enemy.size + item.size + offset * rangeMultiplier + item.behaviour.range * item.size;
                    var minRange = enemy.size + item.size + offset + item.behaviour.minRange * item.size;

                    if (distance < minRange) {
                        item.enemies = [];
                        break;
                    
                    } else if (distance <= maxRange && distance >= minRange && item.enemies.includes(enemy) == false) {
                        item.enemies.push(enemy);

                    }
                }
            }
        }
    }


    if (item.enemies.length > 0) {
        item.status = 'engaged'; 
    } else {
        item.status = 'moving';
    }

}

function dealDamage(item) {

    var damageMultiplier = 0.35;

    if (item.enemies.length > 0) {

        var opponent = item.enemies[Math.floor(Math.random() * item.enemies.length)]
        var damage = item.mStatuses[item.mStatus].damage * damageMultiplier;

        opponent.health -= damage;
        opponent.morale -= damage;
        
        item.morale += damage / 2

        if (opponent.health < 0) {
            opponent.delete();
        }
    }

}



