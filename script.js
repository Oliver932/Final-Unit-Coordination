var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
        units[team].push(new Unit(event.clientX, event.clientY, team, 'Commander', 20, 0, 300, 300));
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

        for (const team in units) {
            if (Object.hasOwnProperty.call(units, team)) {

                if (team != this.team) {
                    
                    for (let i = 0; i < units[team].length; i++) {

                        
                        var opponent = units[team][i];
                        console.log(opponent);

                        if (opponent.morale < (this.morale * 3)) {

                            x +=(this.morale/opponent.morale)/(opponent.x - this.x);
                            y += (this.morale/opponent.morale)/(opponent.y - this.y);

                        } else {

                            x -= (opponent.morale/this.morale)/(opponent.x - this.x);
                            y -= (opponent.morale/this.morale)/(opponent.y - this.y);
                        }

                        

                    }
                }
            
            }
        }
    
    return {'x':x, 'y':y}
        
    }

    this.move = function(score) {
  
        var ratio = score['x'] / score['y']
        var dy = Math.sqrt((this.sMax ** 2)/((ratio **2) + 1));
        var dx = ratio * dy;               

        this.x += dx;
        this.y += dy;

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
