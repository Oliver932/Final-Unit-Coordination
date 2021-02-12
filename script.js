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


var unitNames = ['Swordsman', 'Longswordsman', 'Cossack', 'Knight'];
addEventListener('keypress', function(event){

    try {

        var index = parseInt(event.key) - 1;
        if (index < unitNames.length){

            if (mouse.x < (innerWidth / 2)) {
                var team = 'Oli';
            } else {
                var team = 'Hazza';
            }

            createFormation(team, mouse.x, mouse.y, unitNames[index]);
        }

    } catch (error) {
        console.log(error);
    }
})


var unitTypes = {
    'Longswordsman':{

        'size':7,

        'mStatuses':{
            'charging':{
                'speed':0.7,
                'morale': 3.5
            },
            'advancing':{
                'speed':0.5,
                'morale': 0.35
            },
            'retreating':{
                'speed':0.2,
                'morale': 0.1
            },
            'routed':{
                'speed':0.55,
                'morale': 0
            }
        },

        'mMax':300,
        'hMax':300,

        'formation':{
            'rows':2,
            'columns':2
        },

        'behaviour':{

            'straggler':0.5,
            'burst':50,
            'burstPower':5,
            'group':1,
            'flanking':false

        }
    },

    'Swordsman':{
        'size':6,
        'mStatuses':{
            'charging':{
                'speed':0.8,
                'morale': 3
            },
            'advancing':{
                'speed':0.6,
                'morale': 0.5
            },
            'retreating':{
                'speed':0.45,
                'morale': 0.3
            },
            'routed':{
                'speed':0.75,
                'morale': 0
            }
        },
        'mMax':100,
        'hMax':100,

        'formation':{
            'rows':3,
            'columns':5
        },

        'behaviour':{
            'straggler':1,
            'burst':50,
            'burstPower':5,
            'group':1,
            'flanking':false
        }
    },

    'Cossack':{
        'size':6,
        'mStatuses':{
            'charging':{
                'speed':1.5,
                'morale': 1
            },
            'advancing':{
                'speed':0.75,
                'morale': 0.4
            },
            'retreating':{
                'speed':0.6,
                'morale': 0.35
            },
            'routed':{
                'speed':1,
                'morale': 0
            }
        },
        'mMax':70,
        'hMax':70,

        'formation':{
            'rows':2,
            'columns':4
        },

        'behaviour':{
            'straggler':5,
            'burst':200,
            'burstPower':10,
            'group':1,
            'flanking':true,
            'flankDist':20,
            'flankAngle': 1
        }
    },

    'Knight':{
        'size':7,
        'mStatuses':{
            'charging':{
                'speed':1.2,
                'morale': 0.65
            },
            'advancing':{
                'speed':0.65,
                'morale': 0.6
            },
            'retreating':{
                'speed':0.45,
                'morale': 0.3
            },
            'routed':{
                'speed':0.95,
                'morale': 0
            }
        },
        'mMax':300,
        'hMax':200,

        'formation':{
            'rows':1,
            'columns':4
        },

        'behaviour':{
            'straggler':0.7,
            'burst':150,
            'burstPower':40,
            'group':1,
            'flanking':false
        }
    }
}



var pause = -1
window.addEventListener('keydown', function (event) {

    var key = event.which || event.keyCode;

    if (key == 32) { 
        pause *= -1
      
    }
})

const scale = 1.5;
const offset = 1;

for (const key1 in unitTypes) {
    if (Object.hasOwnProperty.call(unitTypes, key1)) {
        const unitType = unitTypes[key1];

        for (const key2 in unitType.mStatuses) {
            if (Object.hasOwnProperty.call(unitType.mStatuses, key2)) {

                unitType.mStatuses[key2].speed *= scale;
                
            }
        }   
        
    }
}

var images = {};
for (let index = 0; index < unitNames.length; index++) {
    const name = unitNames[index];
    images[name] = new Image();
    images[name].src = name + '.png';
    
}
var img = new Image();
img.src = 'Modern Armor.png';

// img.onload = function () {
//     c.drawImage(img, 20, 20, width, height);
// }

var teamColours = {
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

var Unit = function (x, y, team, type) {

    this.x = x;
    this.y = y;

    this.size = unitTypes[type].size * scale;

    this.mMax = unitTypes[type].mMax;
    this.mStatuses = unitTypes[type].mStatuses;

    this.hMax = unitTypes[type].hMax;
    this.behaviour = unitTypes[type].behaviour;

    this.image = images[type];


    this.team = team;
    this.type = type;

    this.baseMorale = this.mMax;
    this.morale = this.mMax;
    this.health = this.hMax;


    this.status = 'moving';
    this.mStatus = 'advancing';

    this.neighbours = {
        'friends':[],
        'enemies':[]
    }



    this.draw = function () {

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fillStyle = teamColours[this.team][this.status];
        c.fill();

        c.strokeStyle = 'black';

        if (this.type == 'Commander') {
            c.stroke();
        }
        
        c.drawImage(this.image, this.x - this.size * 3, this.y - this.size * 2, this.size * 4, this.size * 4);
    }

    this.update = function () {

        this.draw();

        this.moralise();
        this.fightCheck();

        if (this.mStatuses[this.mStatus].speed > 0 && this.status != 'engaged') {

            this.move(this.chooseTarget());
            // this.move(5/4*Math.PI);
        }

        this.edgeCheck();


    }

    this.distance = function (x,y) {

        return Math.sqrt(((x - this.x)**2) + ((y - this.y)**2))
    }

    this.moralise = function() {

        this.morale = this.baseMorale;

        if (this.behaviour.burst > 0) {
            this.behaviour.burst -= 1;
            this.morale *= this.behaviour.burstPower;
        }

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

        var distFunc = (offset + this.size + friend.size)/(distance);

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

                if (this.neighbours.enemies.includes(combatant) == false){
                    this.neighbours.enemies.push(combatant);
                }

                combatant.status = 'engaged';

                if (combatant.neighbours.enemies.includes(this) == false){
                    combatant.neighbours.enemies.push(this);
                }
            } else if (combatant.team == this.team && combatant != this){

                if (this.neighbours.friends.includes(combatant) == false){
                    this.neighbours.friends.push(combatant);
                }

                if (combatant.neighbours.friends.includes(this) == false){
                    combatant.neighbours.friends.push(this);
                }

            }
        }

        return travel;
        
    }

    this.fightCheck = function() {

        var fight = true
        if (this.status == 'engaged') {

            for (let index = 0; index < this.neighbours.enemies.length; index++) {
                const enemy = this.neighbours.enemies[index];
                var mRatio = this.morale / enemy.morale

                if (mRatio < this.mStatuses.retreating.morale) {
                    fight = false;
                    //break;
                }
                
            }

            if (fight == false){

                this.emptyNeighbours('enemies');
                this.status = 'moving';
            }
        }
    };

    this.delete = function() {
        this.emptyNeighbours('enemies');
        this.emptyNeighbours('friends');

        for (let index = 0; index < units[this.team].length; index++) {
            const mate = units[this.team][index];
                                   
            if ( mate === this) { 
                units[this.team].splice(index, 1); 
                index--; 
            }
        }
        
    }

    this.edgeCheck = function() {
        if (this.x < 0 || this.y < 0 || this.x > innerWidth || this.y > innerHeight){
            this.delete();
        }
    }

    this.emptyNeighbours = function(list) {

        for (let index = 0; index < this.neighbours[list].length; index++) {
                    const enemy = this.neighbours[list][index];

                    for( var i = 0; i < enemy.neighbours[list].length; i++){ 
                                   
                        if ( enemy.neighbours[list][i] === this) { 
                            enemy.neighbours[list].splice(i, 1); 
                            i--; 
                        }
                    }

                    if (enemy.neighbours[list].length == 0 && list == 'enemies') {
                        enemy.status = 'moving';
                    }
                }

                this.neighbours[list] = [];
    }


    this.chooseTarget = function () {

        var xA = 0;
        var xR = 0;

        var yA = 0;
        var yR = 0;

        var tA = 0;
        var tR = 0;


        var accentuate = 12;

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {


                    
                for (let i = 0; i < units[team].length; i++) {

                    // console.log('a', x, y);

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

                            var xRatio = Math.abs((opponent.x - this.x)/(Math.abs(opponent.y - this.y) + Math.abs(opponent.x - this.x)));
                            var yRatio = 1 - xRatio;

                            var engaged = 1

                            if (opponent.status == 'engaged') {

                                engaged = opponent.neighbours.enemies.length * this.behaviour.group;
                            }

                            var friends = this.behaviour.straggler ** opponent.neighbours.friends.length;

                            var mRatio = this.morale / opponent.morale;

                            // var mMultiplier = (mRatio * this.behaviour.sensitivity) ** this.behaviour.power;



                            if (mRatio >= this.mStatuses.retreating.morale && team != this.team) {


                                var dxA = distFunc * xMultiplier * xRatio / (engaged + friends);
                                var dyA = distFunc * yMultiplier * yRatio / (engaged + friends);

                                var flankD = this.flank(opponent, dxA, dyA);

                                

                                xA +=  flankD.dx
                                yA +=  flankD.dy
                                tA += distFunc;
                                // console.log(1 ,x, y, xRatio, yRatio, distFunc, distance);

                            } else if (team != this.team){

                                var dxR = distFunc * xMultiplier * xRatio / (engaged + friends);
                                var dyR= distFunc * yMultiplier * yRatio / (engaged + friends);

                                xR -= dxR
                                yR -= dyR
                                tR += distFunc;
                                // console.log(2, x, y);


                            }

                        }
                    }

                }
                
            
            }
        }

        x = xA + xR;
        y = yA + yR;

        if (tA >= tR * this.mStatuses.charging.morale) {
            this.mStatus = 'charging';
        }else if (tA >= tR * this.mStatuses.advancing.morale) {
            this.mStatus = 'advancing';
        }else if (tA >= tR * this.mStatuses.retreating.morale) {
            this.mStatus = 'retreating';
        } else {
            this.mStatus = 'routed';
        }


        x *= (Math.random() + 0.5)
        y *= (Math.random() + 0.5)
    
        var angle = vectorToAngle(x, y);


        return angle
        
    }

    this.flank = function(opponent, dx, dy){

        var flankD = {'dx':dx, 'dy':dy};
        var xDistance = opponent.x - this.x;
        var yDistance = opponent.y - this.y;

        if (this.behaviour.flanking == true && yDistance != 0) {

            var flanking = this.size * 2 * this.behaviour.flankDist;
            var flankAngle = Math.PI / (2 * this.behaviour.flankAngle);
            var overshoot = 0;

            var xMultiplier = 1;
            if (this.team == 'Hazza'){
                xMultiplier = -1;
            }


            var infront = Math.sign(xDistance + (overshoot * xMultiplier)) * xMultiplier;
            var iAngle = vectorToAngle(dx, dy);
            console.log(iAngle)

            if (infront == 1 && Math.abs(yDistance) < flanking) {
                iAngle += flankAngle * Math.sign(yDistance) * xMultiplier * -1;
            }
            // } else if ( infront == -1 && Math.abs(yDistance) > flanking){
            //     iAngle -= flankAngle * Math.sign(yDistance) * xMultiplier * -1;
            // }
            console.log(iAngle)

            flankD = angleToVector(iAngle, this.mStatuses[this.mStatus].speed);

        }

        return flankD;
    }

    this.calculateObstruction = function(opponent) {

        var blocks = [];

        var distance = this.distance(opponent.x, opponent.y);
        var gap = opponent.size + this.size + offset;
        var angle = vectorToAngle(opponent.x - this.x, opponent.y - this.y);

        if (distance - gap == this.mStatuses[this.mStatus].speed) {
            blocks.push({'opponent':opponent, 'lower':angle, 'upper':angle})
        } else {

            var value = ((distance ** 2) + (this.mStatuses[this.mStatus].speed ** 2) - (gap ** 2))/(2 * distance * this.mStatuses[this.mStatus].speed);
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

                        if (this.distance(opponent.x, opponent.y) - this.size - opponent.size - offset <= this.mStatuses[this.mStatus].speed) {
                            
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

                    //abc
                    if (this.team != obstruction.opponent.team) {
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
            
            this.emptyNeighbours('friends');

            if (stats.impossible == false) {
                var vector = angleToVector(angle, this.mStatuses[this.mStatus].speed);
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
    // console.log(dx, dy);

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
    // console.log(angle);
    return angle
}

function angleToVector(angle, distance) {

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

function checkAngle(angle) {

    if (angle >= 2 * Math.PI) {

        angle -= (Math.PI * 2 * Math.floor(angle/(Math.PI * 2)))
    }

    if (angle < 0) {
        angle += (Math.PI * 2 * (Math.floor(Math.abs(angle/(Math.PI * 2)) + 1)))
    }

    return angle;
    
}

function createFormation(team, X, Y, type) {

    var rows = unitTypes[type].formation.rows;
    var columns = unitTypes[type].formation.columns;
    // pause = -1;

    var increment = (unitTypes[type].size * scale *2) + offset;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {

            units[team].push(new Unit(X + (c * increment), Y + (r * increment), team, type));
            units[team][units[team].length - 1].draw();
            // console.log(team);


        }

    }
    // pause = 1;
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
