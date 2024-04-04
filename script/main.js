/** @type {HTMLCanvasElement} */
class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width - this.canvas.width;
        this.height = this.canvas.height;
        this.baseHeight = 720;
        this.ratio = this.height / this.baseHeight;
        this.player = new Player(this);
        this.background = new Background(this);
        this.gravity;
        this.speed;
        this.minSpeed;
        this.maxSpeed;
        this.numberOfObstacles = Math.floor(Math.random() * 40 + 30);
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.timer;
        this.message1;
        this.message2;
        this.eventTimer = 0;
        this.eventInterval = 150;
        this.eventUpdate = false;
        this.touchStartX;
        this.swipeDistance = 50;
        this.sound = new AudioControl();
        this.marginBottom;
        this.smallFont;
        this.largeFont;

        // when create Game instance the resize event first trigger
        this.resize(window.innerWidth, window.innerHeight);

        // resize
        window.addEventListener("resize", (e) => {
            this.resize(
                e.currentTarget.innerWidth,
                e.currentTarget.innerHeight
            );
        });

        // mouse controls
        this.canvas.addEventListener("mousedown", (e) => {
            this.player.flap();
        });
        this.canvas.addEventListener("mouseup", (e) => {
            this.player.wingsUp();
        });

        // keyboard controls
        window.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                this.player.flap();
            }
            if (e.key === "Shift" || e.key.toLowerCase() === "c") {
                this.player.startCharge();
            }
        });

        window.addEventListener("keyup", (e) => {
            this.player.wingsUp();
        });

        // Touching controls
        this.canvas.addEventListener("touchstart", (e) => {
            this.player.flap();
            this.touchStartX = e.changedTouches[0].pageX;
        });

        this.canvas.addEventListener("touchmove", (e) => {
            if (
                e.changedTouches[0].pageX - this.touchStartX >=
                this.swipeDistance
            ) {
                this.player.startCharge();
            }
        });
    }
    resize(newWidth, newHeight) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.textAlign = "right";
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;
        this.score = 0;
        this.timer = 0;
        this.message1 = "";
        this.message2 = "";
        this.smallFont = 20 * this.ratio;
        this.largeFont = 45 * this.ratio;
        this.ctx.font = `${this.smallFont}px Bungee`;

        this.marginBottom = Math.floor(50 * this.ratio);
        this.gravity = 0.15 * this.ratio;
        this.speed = 2 * this.ratio;
        this.minSpeed = this.speed;
        this.maxSpeed = this.speed * 5;
        this.background.resize();
        this.player.resize();
        this.createObstacles();
        this.obstacles.forEach((obstacle) => {
            obstacle.resize();
        });
    }
    render(deltaTime) {
        if (!this.gameOver) this.timer += deltaTime;
        this.handlePeriodicEvent(deltaTime);
        this.background.update();
        this.background.draw();
        this.player.update();
        this.player.draw();
        this.obstacles.forEach((obstacle) => {
            obstacle.update();
            obstacle.draw();
        });
        this.drawStatusText();
        if (this.obstacles.length === 0) {
            this.gameOver = true;
        }
    }
    drawStatusText() {
        this.ctx.save();
        this.ctx.fillText(
            `Score: ${this.score}`,
            this.width - this.smallFont,
            this.largeFont
        );
        this.ctx.textAlign = "left";
        this.ctx.fillText(
            `Time: ${this.formatTimer()}`,
            this.smallFont,
            this.largeFont
        );
        if (this.gameOver) {
            this.ctx.textAlign = "center";
            this.ctx.font = `${this.largeFont}px Bungee`;
            this.ctx.fillText(
                this.message1,
                this.width * 0.5,
                this.height * 0.5 - this.largeFont,
                this.width
            );
            this.ctx.font = `${this.smallFont}px Bungee`;
            this.ctx.fillText(
                this.message2,
                this.width * 0.5,
                this.height * 0.5 - this.smallFont,
                this.width
            );
            this.ctx.fillText(
                "Press 'R' to try again!",
                this.width * 0.5,
                this.height * 0.5,
                this.width
            );
        }
        if (this.player.energy <= this.player.minEnergy) {
            this.ctx.fillStyle = "red";
        } else if (this.player.energy < 40) {
            this.ctx.fillStyle = "yellow";
        } else {
            this.ctx.fillStyle = "green";
        }
        for (let i = 0; i < this.player.energy; i++) {
            this.ctx.fillRect(
                10,
                this.height - 10 - this.player.barSize * i,
                15,
                this.player.barSize
            );
        }
        this.ctx.restore();
    }

    //helper functions
    createObstacles() {
        this.obstacles = [];
        const firstX = this.baseHeight * this.ratio;
        const widthSpacing = 600 * this.ratio;
        for (let i = 0; i < this.numberOfObstacles; i++) {
            this.obstacles.push(new Obstacle(this, firstX + i * widthSpacing));
        }
    }
    formatTimer() {
        return (this.timer / 1000).toFixed(1);
    }
    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;
        const dist = Math.hypot(dx, dy);
        const sumOfRadius = a.collisionRadius + b.collisionRadius;
        return dist <= sumOfRadius;
    }
    handlePeriodicEvent(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval;
            this.eventUpdate = true;
        }
    }
    triggerGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            console.log(this.obstacles.length);
            if (this.obstacles.length <= 0) {
                this.sound.play(this.sound.win);
                this.message1 = "Nailed it!";
                this.message2 = `Can you do it faster than ${this.formatTimer()} seconds?`;
            } else {
                this.sound.play(this.sound.lose);
                this.message1 = "getting rusty?";
                this.message2 = `Collision time ${this.formatTimer()} seconds`;
            }
        }
    }
}

window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 720;

    const game = new Game(canvas, ctx);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(deltaTime);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});
