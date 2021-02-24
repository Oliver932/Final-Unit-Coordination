import {angleToVector, vectorToAngle} from './vectorFunctions.js';
import smartMorale from './smartMorale.js';
import smartMove from './smartMovement.js';
import smartAttack from './smartAttack.js';
import {unitNames, unitTypes} from './unitData.js';
import createImages from './imageController.js';


var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var diagonal = Math.sqrt((innerHeight ** 2) + (innerWidth ** 2));

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
})

addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})



addEventListener('keypress', function (event) {

    try {

        var index = parseInt(event.key) - 1;
        if (index < unitNames.length) {

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


var pause = -1
window.addEventListener('keydown', function (event) {

    var key = event.which || event.keyCode;

    if (key == 32) {
        pause *= -1

    }
})

const scale = 1.5;
const offset = 10;

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

var images = createImages();

var teamColours = {
    'Oli': {
        'moving': '#00fff3',
        'static': '#007dff',
        'engaged': '#0200b9'
    },
    'Hazza': {
        'moving': '#ec9b00',
        'static': '#ec5300',
        'engaged': '#8b0000'
    }
};

var units = {
    'Oli': [],
    'Hazza': []
};

var Unit = function (x, y, team, type) {

    this.x = x;
    this.y = y;

    this.size = unitTypes[type].size * scale;

    this.mMax = unitTypes[type].mMax;
    this.mStatuses = unitTypes[type].mStatuses;

    this.hMax = unitTypes[type].hMax;
    this.behaviour = unitTypes[type].behaviour;

    this.images = images[type];


    this.team = team;
    this.type = type;

    this.baseMorale = this.mMax;
    this.morale = this.mMax;
    this.health = this.hMax;


    this.status = 'moving';
    this.mStatus = 'advancing';
    this.moraleRatio = 1;

    this.enemies = [];

    if (team == 'Oli') {
        this.orientation = 'R';
    } else {
        this.orientation = 'L';
    }



    this.draw = function () {

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fillStyle = teamColours[this.team][this.status];
        c.fill();

        var multiplier = -1;
        if (this.orientation == 'R') {
            multiplier = -0.3;
        }

        c.drawImage(this.images[this.orientation], this.x + (this.size * 3 * multiplier), this.y - this.size * 2, this.size * 4, this.size * 4);
    }

    this.update = function () {

        this.draw();

        smartMorale(this, units, offset);
        smartAttack(this, units, offset);

        if (this.mStatuses[this.mStatus].speed > 0 && this.status != 'engaged') {

            this.move(this.chooseTarget());
        }

        this.edgeCheck();


    }

    this.distance = function (x, y) {

        return Math.sqrt(((x - this.x) ** 2) + ((y - this.y) ** 2))
    }

    this.delete = function () {

        for (let index = 0; index < units[this.team].length; index++) {
            const mate = units[this.team][index];

            if (mate === this) {
                units[this.team].splice(index, 1);
                index--;
            }
        }


    }

    this.edgeCheck = function () {
        if (this.x < 0 || this.y < 0 || this.x > innerWidth || this.y > innerHeight) {
            this.delete();
        }
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

                        var xMultiplier = Math.sign(opponent.x - this.x);
                        var yMultiplier = Math.sign(opponent.y - this.y);



                        var gap = opponent.size + this.size + offset;


                        if (opponent.team != this.team && distance >= gap) {
                            gap += this.behaviour.range * this.size
                        }

                        var distFunc = Math.sin(1 / (accentuate * ((distance - gap) / diagonal)));
                        if (distFunc < 0) {
                            distFunc *= -1;
                        }
                        // var responsiveness = 10;
                        // var distFunc = 1/(Math.sqrt(Math.sqrt(distance)) + responsiveness);


                        if (distFunc > 0) {

                            var xRatio = Math.abs((opponent.x - this.x) / (Math.abs(opponent.y - this.y) + Math.abs(opponent.x - this.x)));
                            var yRatio = 1 - xRatio;

                            var engaged = 1

                            if (opponent.status == 'engaged') {

                                engaged = opponent.enemies.length * this.behaviour.group;
                            }

                            var mRatio = this.moraleRatio;

                            // var mMultiplier = (mRatio * this.behaviour.sensitivity) ** this.behaviour.power;



                            if (this.mStatus != 'routed' && this.mStatuses != 'retreating' && team != this.team) {


                                var dxA = distFunc * xMultiplier * xRatio / (engaged);
                                var dyA = distFunc * yMultiplier * yRatio / (engaged);

                                var flankD = this.flank(opponent, dxA, dyA);



                                xA += flankD.dx
                                yA += flankD.dy
                                tA += distFunc;
                                // console.log(1 ,x, y, xRatio, yRatio, distFunc, distance);

                            } else if (team != this.team) {

                                var dxR = distFunc * xMultiplier * xRatio / (engaged);
                                var dyR = distFunc * yMultiplier * yRatio / (engaged);

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


        x *= (Math.random() + 0.5)
        y *= (Math.random() + 0.5)

        var angle = vectorToAngle(x, y);


        return angle

    }

    this.flank = function (opponent, dx, dy) {

        var flankD = { 'dx': dx, 'dy': dy };
        var xDistance = opponent.x - this.x;
        var yDistance = opponent.y - this.y;

        if (this.behaviour.flanking == true && yDistance != 0) {

            var flanking = this.size * 2 * this.behaviour.flankDist;
            var flankAngle = Math.PI / (2 * this.behaviour.flankAngle);
            var overshoot = 0;

            var xMultiplier = 1;
            if (this.team == 'Hazza') {
                xMultiplier = -1;
            }


            var infront = Math.sign(xDistance + (overshoot * xMultiplier)) * xMultiplier;
            var iAngle = vectorToAngle(dx, dy);

            if (infront == 1 && Math.abs(yDistance) < flanking) {
                iAngle += flankAngle * Math.sign(yDistance) * xMultiplier * -1;
            }

            flankD = angleToVector(iAngle, this.mStatuses[this.mStatus].speed);

        }

        return flankD;
    }


    this.move = function (angle) {smartMove(this, this.mStatuses[this.mStatus].speed, angle, units, offset)}

}


function createFormation(team, X, Y, type) {

    var rows = unitTypes[type].formation.rows;
    var columns = unitTypes[type].formation.columns;
    // pause = -1;

    var increment = (unitTypes[type].size * scale * 2) + offset + 2;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {

            units[team].push(new Unit(X + (c * increment), Y + (r * increment), team, type));
            units[team][units[team].length - 1].draw();
            // console.log(team);


        }

    }
    // pause = 1;
}



var animate = function () {
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
