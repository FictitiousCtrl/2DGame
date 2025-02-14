class Player {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Usage
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = new Player(50, 50, 32, 32, "Sprite.png");

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();
