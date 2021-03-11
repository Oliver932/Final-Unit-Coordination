import c from './canvasControl.js';
import {angleToVector, vectorToAngle} from './vectorFunctions.js';
import smartMorale from './smartMorale.js';
import smartMove from './smartMovement.js';
import smartAttack from './smartAttack.js';
import smartTarget from './smartTarget.js';
import {unitNames, unitTypes} from './unitData.js';
import createImages from './imageController.js';
import {scale, offset} from './Settings.js';

var images = createImages();

var teamColours = {
    'Oli': {
        'internal':'#00ffef',
        'moving': '#007dff',
        'static': '#007dff',
        'engaged': '#0200b9'
    },
    'Hazza': {
        'internal':'#ffcf40',
        'moving': '#ec5300',
        'static': '#ec5300',
        'engaged': '#8b0000'
    }
};

export var units = [];
export class Unit {
    constructor(x, y, team, type) {

        this.x = x;
        this.y = y;

        this.team = team;
        this.type = type;

        this.morale = unitTypes[type].mMax;
        this.health = unitTypes[type].hMax;

        this.size = unitTypes[type].size * Math.sqrt((this.health / 100));


        this.status = 'moving';
        this.mStatus = 'advancing';
        this.moraleRatio = 1;

        this.enemies = [];
        this.lastMove = 0;

        this.currentAngle = undefined;


        if (team == 'Oli') {
            this.orientation = 'R';
        } else {
            this.orientation = 'L';
        }
    }

    draw () {

        // setup

        var directionRange = Math.PI / 4;

        var directionThickness = 0.35;
        var lineThickness = 0.15 * (this.health / unitTypes[this.type].hMax);

        var imageSize = this.size * 0.7;

        var image = images[this.type][this.orientation];

        // morale circle

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fillStyle = teamColours[this.team].internal;

        var moraleAdjust = unitTypes[this.type].mStatuses.retreating.morale;
        var difference = this.moraleRatio - moraleAdjust;
        var opacity = 1;

        if (difference < 0) {
            opacity = 0;
        } else {
            opacity = (difference) / (1 - moraleAdjust);
        }

        c.globalAlpha = opacity;
        c.fill();

        c.globalAlpha = 1;
        c.beginPath();

        if (this.currentAngle != undefined){

            // health circle portion

            var directionAngle = this.currentAngle - Math.PI / 2;
            
            c.arc(this.x, this.y, this.size- (this.size * lineThickness / 2), directionAngle + directionRange, directionAngle - directionRange);

            c.strokeStyle = teamColours[this.team][this.status];

            c.lineWidth = this.size * lineThickness;

            c.stroke();

            // direction circle portion


            c.beginPath();
            c.arc(this.x, this.y, this.size - (this.size * directionThickness / 2), directionAngle - directionRange, directionAngle + directionRange);


            c.strokeStyle = teamColours[this.team][this.status];

            c.lineWidth = this.size * directionThickness;

            c.stroke();

        } else {

            // health circle full
            
            c.arc(this.x, this.y, this.size- (this.size * lineThickness / 2), 0, 2 * Math.PI);

            c.strokeStyle = teamColours[this.team][this.status];

            c.lineWidth = this.size * lineThickness;

            c.stroke();
        }

        // image

        var multiplier = -1;
        if (this.orientation == 'R') {
            multiplier = -0.3;
        }

        c.drawImage(image, this.x + (imageSize * 3 * multiplier), this.y - imageSize * 2, imageSize * 4, imageSize * 4);
    }

    update() {

        smartMorale(this, units);
        smartAttack(this, units);

        if (unitTypes[this.type].mStatuses[this.mStatus].speed > 0 && this.status != 'engaged') {

            smartMove(this, unitTypes[this.type].mStatuses[this.mStatus].speed, smartTarget(this, units), units);
        }

    }

    delete () {

        for (let index = 0; index < units.length; index++) {
            const mate = units[index];

            if (mate === this) {
                units.splice(index, 1);
                index--;
            }
        }
    }
}