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
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Commander', 6, 0.5, 300, 300));
    }else {
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Soldier', 6, 3, 100, 100));
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

    this.vectorTOangle = function (dx,dy) {

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

        console.log(angle)
        return angle;
    }

    this.chooseTarget = function () {

        var x = 0;
        var y = 0;

        var clusterAttraction = 0;
        var clusterRepulsion = 0.2;

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

                            } else if (team == this.team && (opponent.status == 'static' || this.status == 'static')) {

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
    
    
    return {'x':x * Math.random(), 'y':y * Math.random()}
        
    }

    this.move = function(score) {

        console.log(score.x, score.y);
        var dx = 0;
        var dy = 0;


        if (score.x != 0 && score.y != 0) {

            var ratio = Math.abs(score['x'] / score['y']);
            dy = Math.sign(score.y) * Math.sqrt((this.sMax ** 2)/((ratio **2) + 1));
            dx = Math.sign(score.x) * Math.abs(ratio * dy);

        
        } else if (score.x != 0 && score.y == 0) {

            dx = this.sMax * Math.sign(score.x);

        } else if (score.x == 0 && score.y != 0) {

            dy = this.sMax * Math.sign(score.y);

        }


        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {
                    
                for (let i = 0; i < units[team].length; i++) {
                        
                    var opponent = units[team][i];
                        
                    if (this.distance(opponent.x, opponent.y) - sMax <= offset + this.size + opponent.size) {

                        var xDirection = Math.sign(opponent.x - this.x);
                            
                        var xDist = Math.abs(opponent.x - this.x) - this.size - opponent.size - offset;

                        if (xDist < 0 ){
                            if (team != this.team) {
                                xDist = 0;
                            }
                        }

                        if (Math.sign(dx) == xDirection && Math.abs(dx) > xDist) {
                            dx = xDist * Math.sign(dx)
                        }

                        var yDirection = Math.sign(opponent.y - this.y);
                            
                        var yDist = Math.abs(opponent.y - this.y) - this.size - opponent.size - offset;

                        if (yDist < 0){
                            yDist = 0;
                        }
                            
                        if (Math.sign(dy) == yDirection && Math.abs(dy) > yDist) {
                                dy = yDist  * Math.sign(dy);
                        }
                        

                    }
                }
            }
        }
        

        // for (const team in units) {
        //     if (Object.hasOwnProperty.call(units, team)) {
                    
        //         for (let i = 0; i < units[team].length; i++) {
                        
        //             var opponent = units[team][i];
                        
        //             if (this != opponent) {

        //                 var distance = Math.sqrt(((opponent.x-(this.x + dx)) ** 2) + ((opponent.y - (this.y + dy)) ** 2))
        //                 if (distance < this.size + opponent.size + offset) {

        //                     if (dx != 0 && dy != 0) {

        //                         var vDist = this.distance(opponent.x, opponent.y)
        //                         var sDist = this.size + opponent.size + offset
        //                         var angle = Math.acos(((this.sMax ** 2) + (vDist ** 2) - (sDist **2 ))/ (2 * vDist * this.sMax));
        //                         angle += 1;

        //                     }

        //                 }
        //             }
        //         }
        //     }
        // }

        if (dy == 0 && dx == 0){
            this.status = 'static';
        } else {
            this.status = 'moving';
        }

        console.log(this.vectorTOangle(dx, dy));

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
