


// These values define the world, and get reset
var CUG = {
    seed: '',
    entities: [],
    step: 0
};
var player = null;


//===========================================================
/**********************
 * ENTITY MANAGEMENT
 **********************/

const ENTITY_PLAYER = 1;
const ENTITY_ENEMY = 2;
const ENTITY_SEEDLING = 3;
    // larger weighted entities 
    //      multiple different colors
    //


function getNewEntity( xx, yy, healt, type, sprites ){
    let nuent = {};

    nuent.x = xx;
    nuent.y = yy;
    nuent.health = healt;
    nuent.type = type;

    nuent.mode = 0;     // for player idk
                        // for enemy idk
                        // for seedlings - defines their actions
                            // 0 - idling
                            // 1 - under player control

    nuent.seedlists = []; // Index for close by seedlings

    nuent.spriteIndex = 0;
    nuent.spriteFrames = sprites;

    return nuent;
}

// Function to spawn a new enemy entity
function spawnPlayer(xxx, yyy ) {
    let plyr = getNewEntity(
        xxx,
        yyy,
        100,
        // Randomly choose an enemy type
        ENTITY_PLAYER,
        [
            // Add your base64 enemy sprite strings here, e.g.,
            // 'data:image/png;base64,INSERT_BASE64_STRING_HERE'
        ]
    );
    
    return plyr;
}
    
// Enemy spawn control
const enemySpawnInterval = 1000; // spawn an enemy every 2 seconds
var lastEnemySpawnTime = Date.now();

function calculateSpiralCoordinates(index, radius) {
    // The golden angle in radians
    const goldenAngle = 2.39996323; // Approximately 360° / ϕ^2

    // Convert the index to a float for calculations
    const idx = index;

    // Calculate the angle and distance from the center
    const angle = idx * goldenAngle;
    const distance = radius * Math.sqrt(idx);

    // Compute x and y coordinates
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return [x, y, distance];
}

    
    // Function to spawn a new enemy entity
function spawnEnemy(xxx, yyy ) {
    let enemy = getNewEntity(
        xxx + (Math.random() - 0.5) * 800,
        yyy + (Math.random() - 0.5) * 800,
        100,
        // Randomly choose an enemy type
        ENTITY_ENEMY,
        [
            // Add your base64 enemy sprite strings here, e.g.,
            // 'data:image/png;base64,INSERT_BASE64_STRING_HERE'
        ]
    );
    return enemy;
}


// Function to spawn a new enemy entity
function spawnSeedling(xxx, yyy ) {
    let seedl = getNewEntity(
        xxx + (Math.random() - 0.5) * 800,
        yyy + (Math.random() - 0.5) * 800,
        100,
        // Randomly choose an enemy type
        ENTITY_SEEDLING,
        [
            // Add your base64 enemy sprite strings here, e.g.,
            // 'data:image/png;base64,INSERT_BASE64_STRING_HERE'
        ]
    );
 
    return seedl;
}

function updateEntities(){
    // ---- Update enemy entities ----
    for(let j = 0;j < CUG.entities.length;j++){
        let entity = CUG.entities[j];

        if ( entity.type === ENTITY_PLAYER ) {

            // Check all the seedlings that are idle - switch them to interested in u
            for(let i = 0;i < CUG.entities.length;i++){
                // If idling and close enough
                if( CUG.entities[i].type === ENTITY_SEEDLING &&     // entity is a seedling
                    CUG.entities[i].mode === 0 &&                   // seedling is idle
                    CUG.entities[i].health > 0 ){                   // seedling is alive
                    let distem = Math.hypot(entity.y - CUG.entities[i].y, entity.x - CUG.entities[i].x);
                    if( distem < 100 ){
                        CUG.entities[i].mode = 1;// captured now as a follower
                        entity.seedlists.push( CUG.entities[i] );
                    }
                }
            }

        }
        else if (entity.type === ENTITY_ENEMY) {
            let speed = 200;
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
        else if (entity.type === ENTITY_SEEDLING) {
            // Seedling is under control of player somwhere
            if( entity.mode === 1 ){

                let foundIndex = -1;
                for(let i = 0;i < player.seedlists.length;i++){
                    if(player.seedlists[i] === entity){
                        foundIndex = i;
                    }
                }

                // Didn't find but is still a 1 (should be killed this shouldnt happen)
                if( foundIndex < 0 ){
                    player.health = 0;
                }
                else{
                    let coors = calculateSpiralCoordinates( foundIndex, 20 );

                    let speed = 300;

                    let movspirOffX = 0;//coors[2] * Math.cos( CUG.step / 120 );
                    let movspirOffY = 0;//coors[2] * Math.sin( CUG.step / 120 );


                    // Direct chase toward the player
                    let dx = (player.x+coors[0]+movspirOffX) - entity.x;
                    let dy = (player.y+coors[1]+movspirOffY) - entity.y;

                    const dist = Math.hypot(dx, dy);
                    if (dist > 0) {
                        dx /= dist;
                        dy /= dist;
                        entity.x += dx * (speed * 0.5) * deltaTime;
                        entity.y += dy * (speed * 0.5) * deltaTime;
                    }
                }


            }
        }  
    }
}

function renderAllEntities(){
    // Render all entities
    //CUG.entities.forEach(entity => {
    for(let j = 0;j < CUG.entities.length;j++){
        let entity = CUG.entities[j];
        if (entity.type === ENTITY_PLAYER) {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 20, 0, Math.PI * 2);
            ctx.fill();
        } 
        else if (entity.type === ENTITY_SEEDLING) {
            let ssze = 12;// size of a seedlg
            // Green Triangle
            ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.moveTo(entity.x, entity.y - ssze);
            ctx.lineTo(entity.x - ssze, entity.y + ssze);
            ctx.lineTo(entity.x + ssze, entity.y + ssze);
            ctx.closePath();
            ctx.fill();
        } 
        else if (entity.type === 45) {
            // Yellow Rectangle
            ctx.fillStyle = 'yellow';
            ctx.fillRect(entity.x - 15, entity.y - 10, 30, 20);
        } 
        else if (entity.type === 55) {
            // Orange Hexagon
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = Math.PI / 3 * i;
                let xOffset = 15 * Math.cos(angle);
                let yOffset = 15 * Math.sin(angle);
                if (i === 0) ctx.moveTo(entity.x + xOffset, entity.y + yOffset);
                else ctx.lineTo(entity.x + xOffset, entity.y + yOffset);
            }
            ctx.closePath();
            ctx.fill();
        } 
        else if( ENTITY_ENEMY ) {
            // Default case: Enemies (red for chasers, orange for spiral types)
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            // Default case: Enemies (red for chasers, orange for spiral types)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
//===========================================================


function resetGame( configger ){
    CUG.seed = ''+configger.startingSeed;
    CUG.entities = [];
    CUG.step = 0;

    player = spawnPlayer( 0, 0);

    CUG.entities.push(player); 
}



/**********************
 * GAME UPDATE & RENDER
 **********************/
function update(){//deltaTime) {
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

    updateEntities();

    // Event Type
    if (Date.now() - lastEnemySpawnTime > enemySpawnInterval) {

        let eventType = Math.random();

        // ---- Spawn enemy ----
        if( eventType < 0.2 ){
            let enemy = spawnEnemy(player.x, player.y);
            CUG.entities.push(enemy);
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

    // ---- UI Inactivity Check ----
    checkUIInactivity();
}


function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save and apply camera transform so player stays centered
    ctx.save();
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);

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