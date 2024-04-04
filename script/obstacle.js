class Obstacle {
    constructor(game, x) {
        this.game = game;
        this.spriteWidth = 120;
        this.spriteHeight = 120;
        this.scaleWidth = this.spriteWidth * this.game.ratio;
        this.scaleHeight = this.spriteHeight * this.game.ratio;
        this.x = x;
        this.y = Math.random() * (this.game.height - this.scaleHeight);
        this.speedY =
            Math.random() < 0.5 ? 1 * this.game.ratio : -1 * this.game.ratio;
        this.markedForDeletion = false;
        this.collisionX;
        this.collisionY;
        this.collisionRadius = this.scaleWidth * 0.5;
        this.image = document.getElementById("obstacle_image");
        this.frameX = Math.floor(Math.random() * 4);
    }
    resize() {
        this.scaleWidth = this.spriteWidth * this.game.ratio;
        this.scaleHeight = this.spriteHeight * this.game.ratio;
        this.collisionX = this.scaleWidth;
        this.collisionY = this.scaleHeight;
        this.collisionRadius = this.scaleWidth * 0.4;
    }

    update() {
        this.x -= this.game.speed;
        this.y += this.speedY;
        this.collisionX = this.scaleWidth * 0.5 + this.x;
        this.collisionY = this.scaleHeight * 0.5 + this.y;
        if (!this.game.gameOver) {
            if (this.y >= this.game.height - this.scaleHeight || this.y <= 0) {
                this.speedY *= -1;
            }
        } else {
            this.speedY += 0.1;
        }
        if (this.isOffScreen()) {
            this.markedForDeletion = true;
            this.game.obstacles = this.game.obstacles.filter(
                (obstacle) => !obstacle.markedForDeletion
            );
            this.game.score++;
            if (this.game.obstacles.length <= 0) {
                this.game.triggerGameOver();
            }
        }
        if (this.game.checkCollision(this, this.game.player)) {
            this.game.player.collided = true;
            this.game.player.stopCharge();
            this.game.triggerGameOver();
        }
    }

    draw() {
        this.game.ctx.drawImage(
            this.image,
            this.frameX * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.scaleWidth,
            this.scaleHeight
        );
    }

    isOffScreen() {
        return this.x < -this.scaleWidth - 1 || this.y > this.game.height;
    }
}
