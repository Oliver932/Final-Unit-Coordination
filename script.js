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
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Commander', 6, 0.5, 300, 300));
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
const offset = 10;

var img = new Image();
img.src = 'Modern Armor.png';

// img.onload = function () {
//     c.drawImage(img, 20, 20, width, height);
// }

teamColours = {
    'Oli': {
        'moving' :'cyan',
        'static' :'blue'},
    'Hazza': {
        'moving':'orange',
        'static':'red'}
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

    this.morale = mMax;
    this.health = hMax;

    this.status = 'moving';
    this.deviation = 0;

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

        if (this.sMax > 0) {

            this.move(this.chooseTarget());
        }

    }

    this.distance = function (x,y) {

        return Math.sqrt(((x - this.x)**2) + ((y - this.y)**2))
    }

    this.restrictDistance = function(tAngle, x, y, size){

        var travel = 0;

        var dx = x - this.x;
        var dy = y - this.y;
        var distance = this.distance(x, y);
        var gap = size + this.size + offset;
        var oAngle = vectorToAngle(dx, dy);

        var angle = checkAngle(Math.abs(tAngle - oAngle));

        var b = -2 * distance * Math.cos(angle);
        var c = (distance ** 2) - (gap ** 2);

        var discriminant = (b ** 2) - (4 * c);

        if (discriminant >= 0) {
            travel = ((b * -1) - Math.sqrt(discriminant)) / 2;
        }

        return travel;
        
    }


    this.chooseTarget = function () {

        var x = 0;
        var y = 0;

        var clusterAttraction = 0;
        var clusterRepulsion = 0;

        var accentuate = 12;
        // var limit = Math.sin(1/accentuate);

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {


                    
                for (let i = 0; i < units[team].length; i++) {

                    var opponent = units[team][i];

                    if (this != opponent) {

                        var distance = this.distance(opponent.x, opponent.y)

                        var xMultiplier = 1;
                        var yMultiplier = 1;

                        if (opponent.x < this.x) {
                                xMultiplier = -1
                        }
                            
                        if (opponent.y < this.y) {
                                yMultiplier = -1
                        }

                        var distFunc = Math.sin(1/(accentuate * ((distance - this.size - opponent.size + offset)/diagonal)));

                        if (distFunc > 0) {
                            var xRatio = Math.abs((opponent.x - this.x)/((opponent.y - this.y) + (opponent.x - this.x)));
                            var yRatio = 1 - xRatio;

                            if (opponent.morale < (this.morale * 3) && team != this.team) {

                                x +=(this.morale/opponent.morale)*distFunc * xMultiplier * xRatio;
                                y += (this.morale/opponent.morale)*distFunc * yMultiplier * yRatio;

                            } else if (team != this.team){

                                x -= (opponent.morale/this.morale)*distFunc * xMultiplier * xRatio;
                                y -= (opponent.morale/this.morale)*distFunc * yMultiplier * yRatio;

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

    this.calculateObstruction = function(x, y ,size) {

        var blocks = [];

        var distance = this.distance(x, y);
        var gap = size + this.size + offset;
        var angle = vectorToAngle(x - this.x, y - this.y);

        if (distance - gap == this.sMax) {
            blocks.push({'lower':angle, 'upper':angle})
        } else {

            var value = ((distance ** 2) + (this.sMax ** 2) - (gap ** 2))/(2 * distance * this.sMax);
            var overshoot = Math.acos(value);
            console.log((distance ** 2) + (this.sMax ** 2))
            console.log('0 <= X <= 1 ' + value);
            var angle = vectorToAngle(x - this.x, y - this.y);

            var upper = angle + overshoot;
            var lower = angle - overshoot;
            
            if (lower < 0) {
                blocks.push({'lower':checkAngle(lower), 'upper': Math.PI * 2});
                blocks.push({'lower':0, 'upper':upper});

            } else if (upper > Math.PI * 2) {
                blocks.push({'lower':lower, 'upper': Math.PI * 2});
                blocks.push({'lower':0, 'upper':checkAngle(upper)});

            } else {
                blocks.push({'lower':lower, 'upper':upper});
            }
        }


        // if (a > b){
        //     lower = b;
        //     upper = a;
        // } else {
        //     lower = a;
        //     upper = b;
        // }

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
                            
                        var blocks = this.calculateObstruction(opponent.x, opponent.y, opponent.size);

                            if (blocks.length > 0) {
                                for (let index = 0; index < blocks.length; index++) {
                                    obstructions.push(blocks[index]);
                                    
                                }
                            }

                        }
                    }
                }
            }
        }

        return obstructions;
    }

    this.moderateAngle = function(angle, obstructions) {


        var impossible = false;
        if (obstructions.length > 0) {
        
            for (let index = 0; index < obstructions.length; index++) {
                const obstruction = obstructions[index];
                console.log(obstruction, angle)

                if (angle >= obstruction.lower && angle <= obstruction.upper){

                    impossible = true;
                    console.log(impossible);
                    break;
                }

            }
        } 
        return impossible
    }

    this.move = function(angle) {

        var repeats = 100;

        if (angle != undefined) {

            console.log('initial angle ' + angle);

            var obstructions = this.assessSurroundings();

            var increment = (Math.PI * 2) / repeats;
            var impossible = this.moderateAngle(angle, obstructions)
            console.log(obstructions);

            var repeat = 0;
            var reverse = 1;
            while (impossible == true) {

                repeat += 1
                angle = checkAngle(angle + (increment * repeat * reverse));
                console.log('new angle ' + angle);
                impossible = this.moderateAngle(angle, obstructions);

                reverse *= - 1;
                
                if (repeat == repeats) {
                    break;
                }
            }

            if (impossible == false) {
                this.status = 'moving';


                var vector = angleToVector(angle, this.sMax);

                var dx = vector.dx;
                var dy = vector.dy;

                if (dy == 0 && dx == 0){
                    this.status = 'static';
                } else {
                    this.status = 'moving';
                }

                this.x += dx
                this.y += dy
            
            }

            
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
    console.log(angle)

    return angle
}

function angleToVector(angle, distance) {

    var dx = 0;
    var dy = 0;

    if (angle != undefined) {
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

    console.log(dx, dy);

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

        c.fillStyle = 'rgba(255, 255, 255, 0.2)';
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
