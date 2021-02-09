var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var diagonal = Math.sqrt((innerHeight ** 2) + (innerWidth ** 2));

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
})

addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

addEventListener('click', function(event) {

    var team = undefined;

    if (event.clientX < (innerWidth / 2)) {
        team = 'Oli';
    } else {
        team = 'Hazza';
    }

    if (event.shiftKey == true) {
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Commander', 9, 0.5, 300, 300));
    }else {
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Soldier', 6, 3, 100, 100));
    }

 
})

var pause = 1
window.addEventListener('keydown', function (event) {

    var key = event.which || event.keyCode;

    if (key == 32) { 
        pause *= -1
      
    }
})

const dimension = 10;
const offset = 5;

var img = new Image();
img.src = 'Modern Armor.png';

// img.onload = function () {
//     c.drawImage(img, 20, 20, width, height);
// }

teamColours = {
    'Oli': {
        'moving' :'#00fff3',
        'static' :'#007dff',
        'engaged':'#0200b9'},
    'Hazza': {
        'moving':'#ec9b00',
        'static':'#ec5300',
        'engaged':'#8b0000'}
};

var units = {
    'Oli': [],
    'Hazza':[]
};

var Unit = function (x, y, team, rank, size, sMax, mMax, hMax) {

    this.x = x;
    this.y = y;

    this.size = size;

    this.sMax = sMax;
    this.mMax = mMax
    this.hMax = hMax;

    this.team = team;
    this.rank = rank;

    this.baseMorale = mMax;
    this.morale = mMax;
    this.health = hMax;

    this.status = 'moving';
    this.enemies = [];

    this.draw = function () {

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fillStyle = teamColours[this.team][this.status];
        c.fill();

        c.strokeStyle = 'black';

        if (this.rank == 'Commander') {
            c.stroke();
        }
        
        //c.drawImage(img, this.x, this.y, dimension, dimension);
    }

    this.update = function () {

        this.draw();

        this.moralise();
        this.fightCheck();

        if (this.sMax > 0 && this.status != 'engaged') {

            this.move(this.chooseTarget());
        }

    }

    this.distance = function (x,y) {

        return Math.sqrt(((x - this.x)**2) + ((y - this.y)**2))
    }

    this.moralise = function() {

        this.morale = this.baseMorale;

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {

                for (let i = 0; i < units[team].length; i++) {

                    var opponent = units[team][i];

                    if (this != opponent && team == this.team) {
                        this.calculateMorale(opponent);
                    }
                }
            }
        }
    }

    this.calculateMorale = function(friend) {

        var distance = this.distance(friend.x, friend.y);

        var distFunc = ((offset + this.size + friend.size)/(distance))

        this.morale += distFunc * friend.baseMorale;
    }

    this.restrictDistance = function(tAngle, opponents){

        var travel = undefined;
        var combatant = undefined;

        for (let index = 0; index < opponents.length; index++) {

            // console.log('travel: ' + travel);
            const opponent = opponents[index];

            var x = opponent.x;
            var y = opponent.y;
            var size = opponent.size;

            var dx = x - this.x;
            var dy = y - this.y;
            var distance = this.distance(x, y);
            // console.log('distance: ' + distance);
            var gap = size + this.size + offset;
            // console.log('gap: ' + gap);
            var oAngle = vectorToAngle(dx, dy);
            // console.log('oAngle: ' + oAngle);

            var angle = checkAngle(Math.abs(tAngle - oAngle));
            // console.log('angle: ' + angle);
            if (angle > Math.PI) {
                angle = (Math.PI * 2) - angle;
            }
            // console.log('adjusted angle: ' + angle);
            if (angle != Math.PI && angle != 0) {

                var b = -2 * distance * Math.cos(angle);
                var c = (distance ** 2) - (gap ** 2);

                var discriminant = (b ** 2) - (4 * c);
                // console.log('discriminant: ' + discriminant);

                if (discriminant >= 0) {
                    var nTravel = ((b * -1) - Math.sqrt(discriminant)) / 2;
                    // console.log('nTravel: ' + nTravel);
                }

                if (travel == undefined) {
                    travel = nTravel;
                    combatant = opponent;
                } else if (nTravel < travel){
                    travel = nTravel;
                    combatant = opponent;
                }

            }
        }


        if (travel == undefined) {
            travel = 0;
        }

        if (combatant != undefined) {
            if (combatant.team != this.team && this.morale > combatant.morale /3){
                this.status = 'engaged';

                if (this.enemies.includes(combatant) == false){
                    this.enemies.push(combatant);
                }

                combatant.status = 'engaged';

                if (combatant.enemies.includes(this) == false){
                    combatant.enemies.push(this);
                }
            }
        }

        return travel;
        
    }

    this.fightCheck = function() {

        var fight = true
        if (this.status == 'engaged') {

            for (let index = 0; index < this.enemies.length; index++) {
                const enemy = this.enemies[index];

                if (this.morale < enemy.morale / 3) {
                    fight = false;
                    //break;
                }
                
            }

            if (fight == false){

                for (let index = 0; index < this.enemies.length; index++) {
                    const enemy = this.enemies[index];

                    for( var i = 0; i < enemy.enemies.length; i++){ 
                                   
                        if ( enemy.enemies[i] === this) { 
                            enemy.enemies.splice(i, 1); 
                            i--; 
                        }
                    }

                    if (enemy.enemies.length == 0) {
                        enemy.status = 'moving';
                    }
                }

                this.enemies = [];
                this.status = 'moving';
            }
        }
    };


    this.chooseTarget = function () {

        var x = 0;
        var y = 0;

        var clusterAttraction = 0;
        var clusterRepulsion = 0;

        var accentuate = 12;

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {


                    
                for (let i = 0; i < units[team].length; i++) {

                    var opponent = units[team][i];

                    if (this != opponent) {

                        var distance = this.distance(opponent.x, opponent.y);

                        var xMultiplier = 1;
                        var yMultiplier = 1;

                        if (opponent.x < this.x) {
                                xMultiplier = -1
                        }
                            
                        if (opponent.y < this.y) {
                                yMultiplier = -1
                        }

                        var distFunc = Math.sin(1/(accentuate * ((distance - this.size - opponent.size - offset)/diagonal)));
                        if (distFunc < 0) {
                            distFunc *= -1;
                        }
                        // var responsiveness = 10;
                        // var distFunc = 1/(Math.sqrt(Math.sqrt(distance)) + responsiveness);


                        if (distFunc > 0) {
                            var xRatio = Math.abs((opponent.x - this.x)/((opponent.y - this.y) + (opponent.x - this.x)));
                            var yRatio = 1 - xRatio;

                            var engaged = 1
                            var amplifier = 10;
                            if (opponent.status == 'engaged') {

                                engaged = opponent.enemies.length * amplifier;
                            }

                            if (opponent.morale < (this.morale * 3) && team != this.team) {

                                x +=(this.morale/opponent.morale)*distFunc * xMultiplier * xRatio / engaged;
                                y += (this.morale/opponent.morale)*distFunc * yMultiplier * yRatio / engaged;

                            } else if (team != this.team){

                                x -= (opponent.morale/this.morale)*distFunc * xMultiplier * xRatio / engaged;
                                y -= (opponent.morale/this.morale)*distFunc * yMultiplier * yRatio / engaged;

                            } else if (team == this.team && (opponent.status == 'static' )) {

                                x -= (opponent.morale/this.morale)*distFunc * xMultiplier * xRatio * clusterRepulsion;
                                y -= (opponent.morale/this.morale)*distFunc * yMultiplier * yRatio * clusterRepulsion;

                            } else if (opponent.status == 'moving' && team== this.team && this.status == 'moving') {

                                x +=(this.morale/opponent.morale)*distFunc * xMultiplier * xRatio * clusterAttraction;
                                y += (this.morale/opponent.morale)*distFunc * yMultiplier * yRatio * clusterAttraction;

                            }

                        }
                    }

                }
                
            
            }
        }
        x *= (Math.random() + 0.5)
        y *= (Math.random() + 0.5)
    
        var angle = vectorToAngle(x, y);
        return angle
        
    }

    this.calculateObstruction = function(opponent) {

        var blocks = [];

        var distance = this.distance(opponent.x, opponent.y);
        var gap = opponent.size + this.size + offset;
        var angle = vectorToAngle(opponent.x - this.x, opponent.y - this.y);

        if (distance - gap == this.sMax) {
            blocks.push({'opponent':opponent, 'lower':angle, 'upper':angle})
        } else {

            var value = ((distance ** 2) + (this.sMax ** 2) - (gap ** 2))/(2 * distance * this.sMax);
            var overshoot = Math.acos(value);

            var angle = vectorToAngle(opponent.x - this.x, opponent.y - this.y);

            var upper = angle + overshoot;
            var lower = angle - overshoot;
            
            if (lower < 0) {
                blocks.push({'opponent': opponent, 'lower':checkAngle(lower), 'upper': Math.PI * 2});
                blocks.push({'opponent': opponent, 'lower':0, 'upper':upper});

            } else if (upper > Math.PI * 2) {
                blocks.push({'opponent': opponent, 'lower':lower, 'upper': Math.PI * 2});
                blocks.push({'opponent': opponent, 'lower':0, 'upper':checkAngle(upper)});

            } else {
                blocks.push({'opponent': opponent, 'lower':lower, 'upper':upper});
            }
        }

        return blocks;
    }


    this.assessSurroundings = function () {

        var obstructions = [];

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {
                    
                for (let i = 0; i < units[team].length; i++) {
                        
                    var opponent = units[team][i];
                        
                    if (this != opponent) {

                        if (this.distance(opponent.x, opponent.y) - this.size - opponent.size - offset <= this.sMax) {
                            
                            var blocks = this.calculateObstruction(opponent);


                            for (let index = 0; index < blocks.length; index++) {
                                obstructions.push(blocks[index]);
                                
                            }


                        }
                    }
                }
            }
        }

        return obstructions;
    }

    this.moderateAngle = function(angle, obstructions) {

        var opponents = [];
        var impossible = false;
        var enemy = false;
        if (obstructions.length > 0) {
        
            for (let index = 0; index < obstructions.length; index++) {
                const obstruction = obstructions[index];

                if (angle >= obstruction.lower && angle <= obstruction.upper){

                    impossible = true;
                    opponents.push(obstruction.opponent);

                    if (this.team != obstruction.opponent.team && this.morale > obstruction.opponent.morale / 3) {
                        enemy = true;
                    }

                }

            }

        } 


        return {'impossible':impossible, 'opponents':opponents, 'enemy':enemy}
    }

    this.move = function(angle) {

        var repeats = 200;

        if (angle != undefined) {

            var obstructions = this.assessSurroundings();

            var increment = (Math.PI * 2) / repeats;
            var stats = this.moderateAngle(angle, obstructions)

            var repeat = 0;
            var reverse = 1;
            
            // if (this.y < innerHeight / 2) {
            //     var reverse = 1;
            // } else {
            //     var reverse = -1;
            // }

            while (stats.impossible == true) {

                repeat += 1
                angle = checkAngle(angle + (increment * repeat * reverse));
                stats = this.moderateAngle(angle, obstructions);

                if (stats.enemy) {
                    break;

                }


                reverse *= - 1;
                
                if (repeat == repeats) {
                    break;
                }
            }

            if (stats.impossible == false) {
                var vector = angleToVector(angle, this.sMax);
            } else {
                // console.log(stats)
                var vector = angleToVector(angle, this.restrictDistance(angle, stats.opponents));
            }


            var dx = vector.dx;
            var dy = vector.dy;

            if (dy == 0 && dx == 0 && this.status != 'engaged'){
                this.status = 'static';
            } else if (this.status != 'engaged'){
                this.status = 'moving';
            }

            this.x += dx
            this.y += dy
            

            
        } else {
            this.status = 'static';
        }

        this.draw();
    } 
}

function vectorToAngle(dx,dy) {

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

    angle = checkAngle(angle);

    return angle
}

function angleToVector(angle, distance) {

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

function checkAngle(angle) {

    if (angle > 2 * Math.PI) {

        angle -= (Math.PI * 2 * Math.floor(angle/(Math.PI * 2)))
    }

    if (angle < 0) {
        angle += (Math.PI * 2 * (Math.floor(Math.abs(angle/(Math.PI * 2)) + 1)))
    }

    return angle;
    
}



var animate = function() {
    requestAnimationFrame(animate);

    if (pause == 1) {

        c.fillStyle = 'rgba(255, 255, 255, 1)';
        c.fillRect(0, 0, innerWidth, innerHeight)

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {

                for (let i = 0; i < units[team].length; i++) {
                    units[team][i].update();
            
                }
                
            } 
        }
    }
}

animate();
