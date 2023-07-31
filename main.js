/**@type {HTMLCanvasElement} */

const canv = document.getElementById("canvas");
const ctx = canv.getContext("2d");

const direction = {
    up: -1,
    down: 1,
    left: -1,
    right: 1
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Ship {
    constructor() {
        this.sprite = document.querySelector(".ship");
        this.width = 120;
        this.height = 120;
        this.speed = 2;
        this.evLisSetted = false;
        this.position = {
            x: canv.width / 2 - this.width / 2,
            y: canv.height - this.height
        }
        this.keyState = {
            left: false,
            right: false,
            shoot: false
        }
        this.laserList = [];
        this.isReload = false;
        this.reloadTime = 300;
        this.laserSound = new Audio('./assets/laser.mp3');

        window.addEventListener("keydown", e => {
            switch (e.key) {
                case 'ArrowLeft': this.keyState.left = true;
                    break;
                case 'ArrowRight': this.keyState.right = true;
                    break;
                case 's': this.keyState.shoot = true;
                    break;
            }
        });
        window.addEventListener("keyup", e => {
            switch (e.key) {
                case 'ArrowLeft': this.keyState.left = false;
                    break;
                case 'ArrowRight': this.keyState.right = false;
                    break;
                case 's': this.keyState.shoot = false;
            }
        });
    }

    move(dir) {
        this.position.x += dir * this.speed;
    }

    shoot() {
        this.laserList.push(new Laser(this.position.x + this.width / 2, this.position.y));
        this.laserSound.play();
    }

    async update() {
        if (this.keyState.left) this.move(direction.left);
        if (this.keyState.right) this.move(direction.right);

        if (this.keyState.shoot) {
            if (!this.isReload) {
                this.isReload = true;
                this.shoot();
                await new Promise(r => setTimeout(r, this.reloadTime));
                this.isReload = false;
            }
        }

        if (this.laserList.length > 0) {
            for (let laser of this.laserList) {
                laser.draw();
                laser.move(direction.up);
            }
        }
    }

    draw() {
        ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
    }
}

class Laser {
    constructor(x, y) {
        this.sprite = document.querySelector(".laser");
        this.position = { x, y }
        this.width = 20;
        this.height = 40;
        this.speed = 4;
        this.rectangle = {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        }
    }

    move(dir) {
        this.position.y += dir * this.speed;
    }

    draw() {
        ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
    }
}

class Meteor {
    constructor(x) {
        this.sprite = document.querySelector(".meteor");
        this.position = {
            x, y: 0
        }
        this.width = 60;
        this.height = 60;
        this.speed = 1;
        this.rectangle = {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        }
    }

    move(dir) {
        this.position.y += dir * this.speed;
    }

    draw() {
        ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
    }
}

let interval = undefined;

class Game {

    constructor() {
        this.ship = new Ship();
        this.meteorList = [];
        this.score = 0;
        this.generationTimeout = 600;
        //DEBUG this.remInt = setInterval(() => {console.log(this.meteorList.length); console.log(this.ship.laserList.length)}, 1000);
        this.genInterval = setInterval(() => this.meteorList.push(new Meteor(getRandomInt(0, canv.width - 60))), this.generationTimeout);
    }

    drawAndMoveAllMeteors() {
        if (this.meteorList.length > 0) {
            for (let item of this.meteorList) {
                item.draw();
                item.move(direction.down);
            }
        }
    } 

    removeOwerflow() {
        for(let i = 0; i < this.meteorList.length; i++) {
            if(this.meteorList[i].position.y >= canv.height) {
                this.meteorList.splice(i, 1);
            }
        }
        for(let i = 0; i < this.ship.laserList.length; i++) {
            if(this.ship.laserList[i].position.y + this.ship.laserList[i].height <= 0) {
                this.ship.laserList.splice(i, 1);
            }
        }
    }

    isGameOver() {
        for(let meteor of this.meteorList) {
            if(meteor.position.y + meteor.height >= canv.height) return true;
        }
        return false;
    }

    showScore() {
        ctx.fillStyle = 'cyan';
        ctx.font = '30px serif';
        ctx.fillText(this.score, 30, 30);
    }

    checkCollision() {
        for (let i = 0; i < this.meteorList.length; i++) {
            for (let j = 0; j < this.ship.laserList.length; j++) {
                if (this.ship.laserList[j].position.y <= 
                    this.meteorList[i].position.y + this.meteorList[i].height
                    && this.ship.laserList[j].position.x >= this.meteorList[i].position.x - 10
                    && this.ship.laserList[j].position.x 
                    <= this.meteorList[i].position.x + this.meteorList[i].width + 10) {

                    this.score++;
                    this.meteorList.splice(i, 1);
                    this.ship.laserList.splice(j, 1);
                }
            }
        }
    }

    update() {
        this.removeOwerflow();
        this.ship.update();
        this.drawAndMoveAllMeteors();
        this.checkCollision();
        

        if(this.isGameOver()) {
            clearInterval(interval);
        }
    }

    draw() {
        ctx.clearRect(0, 0, canv.width, canv.height);
        this.showScore()
        this.ship.draw();
    }

    mainLoop() {
        this.draw();
        this.update();
    }
}

const game = new Game();

interval = setInterval(() => game.mainLoop(), 1000 / 400);