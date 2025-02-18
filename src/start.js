


// These values define the world, and get reset
var CUG = {
    seed: '',
    entities: [],
    step: 0,
    enemies: [],
    idtracker: 0,
    paused: false,
};
var player = null;


//===========================================================
// !!!!! do -NOT MODIFY- this line - it is where entities.js is inserted !!!!!
//===========================================================


function resetGame( configger ){
    CUG.seed = ''+configger.startingSeed;
    CUG.entities = [];
    CUG.step = 0;
    CUG.enemies = [];// list of all the running entities
    CUG.idtracker = 0;
    CUG.paused = false;

    player = spawnPlayer( 0, 0);

    CUG.entities.push(player);
}



/**********************
 * GAME UPDATE & RENDER
 **********************/
function update(){//deltaTime) {

    if(!CUG.paused){
        // ---- Player movement ----
        let moveX = 0, moveY = 0;
        const speed = 20; // pixels per second

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
        player.vx += moveX * speed * deltaTime;
        player.vy += moveY * speed * deltaTime;

        player.vx *= 0.93;
        player.vy *= 0.93;

        player.x += player.vx;
        player.y += player.vy;

        // ---- Camera smooth follow ----
        camera.x += (player.x - camera.x) * camera.smoothSpeed;
        camera.y += (player.y - camera.y) * camera.smoothSpeed;

        updateEntities();

        // Event Type
        if (Date.now() - lastEnemySpawnTime > enemySpawnInterval) {

            let eventType = Math.random();

            // ---- Spawn enemy ----
            if( eventType < 0.2 ){
                let enemy = spawnEnemy(player.x, player.y);
                CUG.entities.push(enemy);
                CUG.enemies.push(enemy);
                lastEnemySpawnTime = Date.now();
            }
            // ---- Spawn seedling --- 
            else{
                let sedling = spawnSeedling(player.x, player.y);
                CUG.entities.push(sedling);
                lastEnemySpawnTime = Date.now();
            }

        }

        // ---- Powerup Popup Logic ----
        if (Date.now() - lastPowerupTime > powerupInterval) {
            showPowerupPopup();
            lastPowerupTime = Date.now();
        }

        CUG.step += 1;
    }

    // ---- UI Inactivity Check ----
    checkUIInactivity();
}


function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save and apply camera transform so player stays centered
    ctx.save();
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);
    ctx.drawImage(background, 0, 0, 2048, 2048);

    renderAllEntities();

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