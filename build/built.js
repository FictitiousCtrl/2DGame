


// These values define the world, and get reset
var CUG = {
    seed: '',
    entities: [],
};
var player = null;


//===========================================================
/**********************
 * ENTITY MANAGEMENT
 **********************/

const ENTITY_PLAYER = 1;
const ENTITY_ENEMY = 2;


function getNewEntity( xx, yy, healt, type, sprites ){
    let nuent = {};

    nuent.x = xx;
    nuent.y = yy;
    nuent.health = healt;
    nuent.type = type;

    nuent.spriteIndex = 0;
    nuent.spriteFrames = sprites;

    return nuent;


}
    
// Enemy spawn control
const enemySpawnInterval = 2000; // spawn an enemy every 2 seconds
var lastEnemySpawnTime = Date.now();
    
    // Function to spawn a new enemy entity
function spawnEnemy(xxx, yyy ) {
    let enemy = getNewEntity(
        xxx + (Math.random() - 0.5) * 800,
        yyy + (Math.random() - 0.5) * 800,
        50,
        // Randomly choose an enemy type
        ENTITY_ENEMY,
        [
            // Add your base64 enemy sprite strings here, e.g.,
            // 'data:image/png;base64,INSERT_BASE64_STRING_HERE'
        ]
    );
    return enemy;
}
//===========================================================


function resetGame( configger ){
    CUG.seed = ''+configger.startingSeed;
    CUG.entities = [];

    
    // The player entity (first in the entities array)
    player = getNewEntity(
        0,
        0,
        100,
        ENTITY_PLAYER,
        0,
        // spriteFrames is an array of base64 strings for each frame
        [
            // Add your base64 player sprite strings here, for example:
            // 'data:image/png;base64,INSERT_BASE64_STRING_HERE'
        ]
    );

    CUG.entities.push(player); 
}



/**********************
 * GAME UPDATE & RENDER
 **********************/
function update(deltaTime) {
    // ---- Player movement ----
    let moveX = 0, moveY = 0;
    const speed = 200; // pixels per second

    // Keyboard input (arrow keys / WASD)
    if (keys['ArrowUp'] || keys['w'])    moveY -= 1;
    if (keys['ArrowDown'] || keys['s'])    moveY += 1;
    if (keys['ArrowLeft'] || keys['a'])    moveX -= 1;
    if (keys['ArrowRight'] || keys['d'])   moveX += 1;

    // Normalize the vector if needed
    if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;
    }

    // Trackpad drag adds to movement direction
    if (trackpad.active) {
        let dx = trackpad.currentX - trackpad.startX;
        let dy = trackpad.currentY - trackpad.startY;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
            moveX += dx;
            moveY += dy;
            const total = Math.hypot(moveX, moveY);
            if (total > 0) {
                moveX /= total;
                moveY /= total;
            }
        }
    }

    // Update player position
    player.x += moveX * speed * deltaTime;
    player.y += moveY * speed * deltaTime;

    // ---- Camera smooth follow ----
    camera.x += (player.x - camera.x) * camera.smoothSpeed;
    camera.y += (player.y - camera.y) * camera.smoothSpeed;

    // ---- Update enemy entities ----
    for (let entity of CUG.entities) {
        if (entity.type === ENTITY_ENEMY) {
            // Direct chase toward the player
            let dx = player.x - entity.x;
            let dy = player.y - entity.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
                dx /= dist;
                dy /= dist;
                entity.x += dx * (speed * 0.5) * deltaTime;
                entity.y += dy * (speed * 0.5) * deltaTime;
            }
        }  
    }

    // ---- Spawn Enemies ----
    if (Date.now() - lastEnemySpawnTime > enemySpawnInterval) {
        console.log('goin at', player.x, player.y)
        let enemy = spawnEnemy(player.x, player.y);
        CUG.entities.push(enemy);
        lastEnemySpawnTime = Date.now();
    }

    // ---- Powerup Popup Logic ----
    if (Date.now() - lastPowerupTime > powerupInterval) {
        showPowerupPopup();
        lastPowerupTime = Date.now();
    }

    // ---- UI Inactivity Check ----
    checkUIInactivity();
}


function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save and apply camera transform so player stays centered
    ctx.save();
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);

    // Render all entities
    CUG.entities.forEach(entity => {
        if (entity.type === ENTITY_PLAYER) {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 20, 0, Math.PI * 2);
            ctx.fill();
        } 
        else {
            // Enemies: red for chasers, orange for spiral types
            ctx.fillStyle =  'red';
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();

    // ---- Draw the Trackpad Graphic ----
    if (trackpad.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = trackpad.opacity;
        // Draw a fixed circle near the bottom center as the trackpad base
        const padX = canvas.width / 2;
        const padY = canvas.height - 100;
        const radius = 50;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(padX, padY, radius, 0, Math.PI * 2);
        ctx.stroke();
        // If dragging, draw an indicator line for the drag direction
        if (trackpad.active) {
            let dx = trackpad.currentX - trackpad.startX;
            let dy = trackpad.currentY - trackpad.startY;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
                ctx.beginPath();
                ctx.moveTo(padX, padY);
                ctx.lineTo(padX + dx * radius, padY + dy * radius);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}