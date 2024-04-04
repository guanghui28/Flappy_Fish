/** @type {HTMLCanvasElement} */
class Player {
    constructor(game) {
        this.game = game;
        this.x = 20;
        this.y;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.width;
        this.height;
        this.speedY = -5;
        this.flapSpeed;
        this.collisionX = this.x;
        this.collisionY;
        this.collisionRadius;
        this.collided;
        this.energy = 40;
        this.maxEnergy = this.energy * 2;
        this.minEnergy = 20;
        this.charging = false;
        this.barSize;
        this.image = document.getElementById("player-image");
        this.frameY;
    }

    resize() {
        this.width = this.spriteWidth * this.game.ratio;
        this.height = this.spriteHeight * this.game.ratio;
        this.y = this.game.height * 0.5 - this.height * 0.5;
        this.speedY = -5 * this.game.ratio;
        this.flapSpeed = 5 * this.game.ratio;
        this.collisionX = this.x + this.width * 0.7;
        this.collisionY = this.y + this.height * 0.7;
        this.collisionRadius = this.width * 0.3;
        this.collided = false;
        this.charging = false;
        this.barSize = Math.floor(5 * this.game.ratio);
        this.game.ctx.strokeStyle = "white";
        this.game.ctx.lineWidth = 1;
        this.frameY = 0;
    }

    update() {
        this.handleEnergy();
        if (this.speedY >= 0) this.wingsUp();
        this.y += this.speedY;
        this.collisionY = this.y + this.height * 0.5;
        if (!this.isTouchingBottom() && !this.charging) {
            this.speedY += this.game.gravity;
        } else {
            this.speedY = 0;
        }
        // bottom boundaries
        if (this.isTouchingBottom()) {
            this.y = this.game.height - this.height - this.game.marginBottom;
            this.wingsIdle();
        }
    }
    draw() {
        this.game.ctx.drawImage(
            this.image,
            0,
            this.frameY * this.spriteHeight,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    startCharge() {
        if (this.energy >= this.minEnergy && !this.charging) {
            this.charging = true;
            this.game.speed = this.game.maxSpeed;
            this.wingsCharge();
            this.game.sound.play(this.game.sound.charge);
        } else {
            this.stopCharge();
        }
    }
    stopCharge() {
        this.charging = false;
        this.game.speed = this.game.minSpeed;
    }
    isTouchingBottom() {
        return (
            this.y >= this.game.height - this.height - this.game.marginBottom
        );
    }
    isTouchingTop() {
        return this.y <= 0;
    }
    flap() {
        this.stopCharge();
        if (!this.isTouchingTop()) {
            this.game.sound.play(
                this.game.sound.flapSounds[Math.floor(Math.random() * 5)]
            );
            this.speedY = -this.flapSpeed;
        }
        this.wingsDown();
    }
    handleEnergy() {
        if (this.game.eventUpdate) {
            if (this.energy < this.maxEnergy) {
                this.energy += 1;
            }
            if (this.charging) {
                this.energy -= 4;
                if (this.energy <= 0) {
                    this.energy = 0;
                    this.stopCharge();
                }
            }
        }
    }
    wingsIdle() {
        if (!this.charging) this.frameY = 0;
    }
    wingsDown() {
        if (!this.charging) this.frameY = 1;
    }
    wingsUp() {
        if (!this.charging) this.frameY = 2;
    }
    wingsCharge() {
        this.frameY = 3;
    }
}
