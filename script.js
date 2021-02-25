import {angleToVector, vectorToAngle} from './vectorFunctions.js';
import smartMorale from './smartMorale.js';
import smartMove from './smartMovement.js';
import smartAttack from './smartAttack.js';
import smartTarget from './smartTarget.js';
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

const scale = 0.75;
const offset = 4;

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

        smartMorale(this, units, offset);
        smartAttack(this, units, offset);

        if (this.mStatuses[this.mStatus].speed > 0 && this.status != 'engaged') {

            smartMove(this, this.mStatuses[this.mStatus].speed, smartTarget(this, units), units, offset);
        }

        this.draw();


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
