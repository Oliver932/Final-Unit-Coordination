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

    console.log(event);

    var team = undefined;

    if (event.clientX < (innerWidth / 2)) {
        team = 'Oli';
    } else {
        team = 'Hazza';
    }

    if (event.shiftKey == true) {
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Commander', 20, 1, 300, 300));
    }else {
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Soldier', 10, 3, 100, 100));
    }

 
})

const dimension = 10;


var img = new Image();
img.src = 'Modern Armor.png';

// img.onload = function () {
//     c.drawImage(img, 20, 20, width, height);
// }

teamColours = {
    'Oli': 'cyan',
    'Hazza': 'red'
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

    this.engaged = false;

    this.draw = function () {

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fillStyle = teamColours[this.team];
        c.fill();

        c.strokeStyle = 'black';

        if (this.rank == 'Commander') {
            c.stroke();
        }
        
        //c.drawImage(img, this.x, this.y, dimension, dimension);
    }

    this.update = function () {

        this.draw();

        if (this.sMax > 0 && this.engaged == false) {

            this.move(this.chooseTarget());
        }

    }

    this.distance = function (x,y) {

        return Math.sqrt(((x - this.x)**2) + ((y - this.y)**2))
    }

    this.chooseTarget = function () {

        var x = 0;
        var y = 0;

        var offset = 0;
        var accentuate = 2;

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {

                if (team != this.team) {
                    
                    for (let i = 0; i < units[team].length; i++) {

                        
                        var opponent = units[team][i];
                        var distance = this.distance(opponent.x, opponent.y)

                        if (distance > this.size + opponent.size) {

                            var xMultiplier = 1;
                            var yMultiplier = 1;

                            if (opponent.x < this.x) {
                                xMultiplier = -1
                            }
                            
                            if (opponent.y < this.y) {
                                yMultiplier = -1
                            }

                            var distFunc = Math.sin(1/(accentuate*((distance * 2 * Math.PI)/diagonal)) + 0.317 + offset);

                            var xRatio = Math.abs((opponent.x - this.x)/((opponent.y - this.y) + (opponent.x - this.x)));
                            var yRatio = 1 - xRatio;

                            if (opponent.morale < (this.morale * 3)) {

                                x +=(this.morale/opponent.morale)*distFunc * xMultiplier * xRatio;
                                y += (this.morale/opponent.morale)*distFunc * yMultiplier * yRatio;

                            } else {

                                x -= (opponent.morale/this.morale)*distFunc * xMultiplier * xRatio;
                                y -= (opponent.morale/this.morale)*distFunc * yMultiplier * yRatio;
                            }

                        }

                    }
                }
            
            }
        }
    
    return {'x':x, 'y':y}
        
    }

    this.move = function(score) {

        var dx = 0;
        var dy = 0;

        if (score.x != 0 && score.y != 0) {

            // var xMultiplier = 1;
            // var yMultiplier = 1;

            // if (score.x < 0) {
            //     xMultiplier = -1
            // }
                        
            // if (score.y < 0) {
            //     yMultiplier = -1
            // }


            var ratio = score['x'] / score['y'];
            dy = Math.sqrt((this.sMax ** 2)/((ratio **2) + 1));
            dx = ratio * dy;

            if (score.y < 0) {
                dy *= -1;
                dx *= -1;
            }

            // dx *= xMultiplier;
            // dy *= yMultiplier;



        
        } else if (score.x != 0 && score.y == 0) {

            dx = this.sMax;

        } else if (score.x == 0 && score.y != 0) {

            dy = this.sMax;
        }


        this.x += dx
        this.y += dy

        this.draw();
        
    }
}




var animate = function() {
    requestAnimationFrame(animate);

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

animate();
