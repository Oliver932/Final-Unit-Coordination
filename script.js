
import c from './canvasControl.js';
import {units, Unit} from './Unit.js';
import {unitNames, unitTypes} from './unitData.js';
import {offset} from './Settings.js';

var mouse = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
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


var data = {
    'health': {
        'Oli':0,
        'Hazza':0
    }
}


function createFormation(team, X, Y, type) {

    var rows = unitTypes[type].formation.rows;
    var columns = unitTypes[type].formation.columns;
    // pause = -1;

    var increment = (unitTypes[type].size * 2 * Math.sqrt(unitTypes[type].hMax / 100)) + offset + 2;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {

            units.push(new Unit(X + (c * increment), Y + (r * increment), team, type));

        }

    }

    data.health[team] += rows * columns * unitTypes[type].hMax;
    drawScreen();
    // pause = 1;
}

function printData() {

    c.textAlign = "center";
    c.fillStyle = 'rgba(0, 0, 0, 1)';
    c.font = "20px Comic Sans MS";

    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const element = data[key];

            var length =  Object.keys(element).length

            if (length > 0){

                var split = innerWidth / (length + 1);

                var index = 1
                for (const team in element) {
                    if (Object.hasOwnProperty.call(element, team)) {

                        const value = element[team];

                        c.fillText(key + ': ' + value.toString(), split * (index), innerHeight - 60);
                        index ++;
                    }
                    
                }


            }
            
        }
    }

}


function drawScreen() {
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fillRect(0, 0, innerWidth, innerHeight)

    for (let i = 0; i < units.length; i++) {
        units[i].draw();

    }

    printData();
}

var animate = function () {
    requestAnimationFrame(animate);

    if (pause == 1) {

        data = {
            'health': {
                'Oli':0,
                'Hazza':0
            }
        }


        for (let i = 0; i < units.length; i++) {
            units[i].update();
            data.health[units[i].team] += units[i].health;

        }

        drawScreen();
    }
}

animate();
