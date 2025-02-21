


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
/**********************
 * ENTITY MANAGEMENT
 **********************/

const ENTITY_PLAYER = 1;
const ENTITY_ENEMY = 2;
const ENTITY_SEEDLING = 3;

// var possibleLables = [
//     { label: "PLAYER", val: 1},
//     { label: "ENEMY", val: 2},
//     { label: "SEEDLING", val: 3},
// ];

    // have the seedlings break off to do stuff 
    // defensive seedlings, 

    // Expldr


    // multipliers u can hit 
    // traps u can run into and hurt

    // rando generator for ost

    // 

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

function springForce(x1, y1, x2, y2, k, restLength) {
    // Compute the difference in position
    let dx = x2 - x1;
    let dy = y2 - y1;
    
    // Compute the distance
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return { fx: 0, fy: 0 }; // Prevent divide by zero
    
    // Compute the force magnitude
    let forceMagnitude = -k * (distance - restLength);
    
    // Compute the unit vector
    let ux = dx / distance;
    let uy = dy / distance;
    
    // Compute the force components
    let fx = forceMagnitude * ux;
    let fy = forceMagnitude * uy;
    
    return { fx, fy };
}

    

function getNewEntity( xx, yy, healt, type, sprites ){
    CUG.idtracker += 1;

    let nuent = {};

    nuent.id = 0 + CUG.idtracker;

    nuent.offr = nuent.id * 1273 + nuent.id*nuent.id*23;    // built in offset value (doesnt have to be detemrinistic but it is rn)

    nuent.x = xx;
    nuent.y = yy;
    nuent.vx = 0;
    nuent.vy = 0;
    nuent.health = healt;
    nuent.type = type;

    nuent.mode = 0;     // for player idk
                        // for enemy idk
                        // for seedlings - defines their actions
                            // 0 - idling
                            // 1 - under player control

    nuent.seedlists = []; // Index for close by seedlings

    nuent.maxCapacity = 10;// standard max capacity in its own seedlists val

    nuent.actionFreq = 65; // every 65 frames do your action

    nuent.hurtSince = 1; // if 0 it was just hurt, and then slowly move it like 5% towards 1.0

    nuent.horFlip = 0; // value between 0 ( facing perfectly right,) and 1 (facing perfeclty left)

    nuent.targetEntity = null; // i think just used for seedling

    nuent.spriteIndex = 0;
    nuent.spriteFrames = sprites;

    return nuent;
}

function setSeedlingToJoinLeader(){

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
    
    plyr.maxCapacity = 99999;
    return plyr;
}
    
// Enemy spawn control
const enemySpawnInterval = 1000; // spawn an enemy every 2 seconds
var lastEnemySpawnTime = Date.now();

    
    // Function to spawn a new enemy entity
function spawnEnemy(xxx, yyy ) {
    let enemy = getNewEntity(
        xxx + (Math.random() - 0.5) * 800,
        yyy + (Math.random() - 0.5) * 800,
        34,
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

        // Entity health is dead
        if( entity.health <= 0 && false){

        }
        // Health is good
        else{

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
                let speed = 23;

                speed -= entity.seedlists.length*2;

                // Direct chase toward the player
                let dx = player.x - entity.x;
                let dy = player.y - entity.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    dx /= dist;
                    dy /= dist;
                    entity.vx += dx * (speed * 0.5) * deltaTime;
                    entity.vy += dy * (speed * 0.5) * deltaTime;
                }

                // Attached seedlist entities pull on the enemy itself
                for(let i = 0;i < entity.seedlists.length;i++){
                    
                    let frcs = springForce( entity.seedlists[i].x, entity.seedlists[i].y,
                        entity.x, entity.y, 0.003, 30 + (50 * Math.sin( CUG.step / 87 )) );

                    entity.vx += frcs.fx;
                    entity.vy += frcs.fy;
                }

                // See if action time 
                if( ((CUG.step + entity.offr) % entity.actionFreq) === 0){
                    
                    // If anyone attach do sum damage
                    for(let i = 0;i < entity.seedlists.length;i++){

                        // (only if seedlings, so like othe renemies can be in the following list i guess?)
                        if( entity.seedlists[i].type === ENTITY_SEEDLING ){
                            entity.seedlists[i].health -= 1;
                            entity.seedlists[i].hurtSince = 0;
                        }
                    }

                }
            }  
            else if (entity.type === ENTITY_SEEDLING) {
                // Seedling is under control of player somwhere
                if( entity.mode === 1 ){

                    // Find self in the player lilst
                    let foundIndex = -1;
                    for(let i = 0;i < player.seedlists.length;i++){
                        if(player.seedlists[i] === entity){
                            foundIndex = i;
                        }
                    }

                    // Look for closest thing of interest - go through the enemies i guess?
                    let closestEnem = -1;
                    let closestDist = 9999999999;
                    for(let i = 0;i < CUG.enemies.length;i++){
                        let ddist = Math.hypot(entity.x-CUG.enemies[i].x, entity.y-CUG.enemies[i].y);

                        if(ddist < 80 && ddist < closestDist && CUG.enemies[i].seedlists.length < CUG.enemies[i].maxCapacity){
                            closestEnem = i;
                            closestDist = ddist;
                        }
                    }

                    // Didn't find but is still a 1 (should be killed this shouldnt happen)
                    if( foundIndex < 0 ){
                        player.health = 0;
                    }
                    else{
                        let coors = calculateSpiralCoordinates( foundIndex, 20 );

                        let speed = 44;

                        let movspirOffX = 14*Math.cos( CUG.step / 120 );//0;//coors[2] * Math.cos( CUG.step / 120 );
                        let movspirOffY = 12*Math.sin( CUG.step / 140 ) * Math.cos( CUG.step / 90 );//0;//coors[2] * Math.sin( CUG.step / 120 );

                        // Direct chase toward the player
                        let dx = (player.x+coors[0]+movspirOffX) - entity.x;
                        let dy = (player.y+coors[1]+movspirOffY) - entity.y;

                        const dist = Math.hypot( dx, dy );
                        if ( dist > 0 ) {
                            dx /= dist;
                            dy /= dist;
                            entity.vx += dx * ( speed * 0.5 ) * deltaTime;
                            entity.vy += dy * ( speed * 0.5 ) * deltaTime;
                        }

                        // Attach to enemy instead it is closest 
                        if( closestEnem > -1 ){
                            entity.mode = 2;// set tp agro
                            entity.targetEntity = CUG.enemies[closestEnem];
                            CUG.enemies[closestEnem].seedlists.push(entity);

                            player.seedlists.splice( foundIndex, 1 );
                        }
                    } 
                }
                
                // Seedling is aggro'd on something
                else if( entity.mode === 2 ){
                    
                    //if thesres is a targentity detected and it's alive
                    if(entity.targetEntity){

                        
                        if( ((CUG.step + entity.offr) % entity.actionFreq) === 0 ){

                            // Do damage if it's an 
                            if( entity.targetEntity.type === ENTITY_ENEMY ){
                                entity.targetEntity.health -= 1;
                                entity.targetEntity.hurtSince = 0;
                            }

                        }


                        let speed = 300;

                        // Direct chase toward the player
                        let dx = ( entity.targetEntity.x ) - entity.x;
                        let dy = ( entity.targetEntity.y ) - entity.y;
    
                        let frcs = springForce( entity.targetEntity.x, entity.targetEntity.y,
                            entity.x, entity.y, 0.008, 40 + (20 * Math.sin( CUG.step / 14 )) );
    
                        // Bounce off your friends
                        let friends = entity.targetEntity.seedlists;
                        for(let i = 0;i < friends.length;i++){
                            let entToCheckPushBack = null;
                            if(friends[i] !== entity ){ // if not u, check if u can collide  
                                entToCheckPushBack = friends[i];
                            }
                            else{
                                entToCheckPushBack = entity.targetEntity;
                            }
    
                            let dx = friends[i].x - entity.x;
                            let dy = friends[i].y - entity.y;
                            
                            // Compute the distance
                            let distance = Math.sqrt(dx * dx + dy * dy); 
                            distance = Math.max(0.001, distance);
                                
                            
                            // Compute the unit vector
                            let ux = (dx / distance)*0.4;
                            let uy = (dy / distance)*0.4;
    
                            if(distance < 30 ){
                                entity.vx -= ux;
                                entity.vy -= uy;
                            }
                        } 
                        
                        entity.vx += frcs.fx;
                        entity.vy += frcs.fy;

                    }

                    // No target entity (it is null)
                    else{

                        // for(let h = entity.targetEntity.seedlists.length-1;h > -1;h--){
                        //     if(entity.targetEntity.seedlists[h] === entity){
                        //         entity.targetEntity.seedlists.splice( h, 1 );
                        //     }
                        // }
                        entity.targetEntity = null;
                        
                        entity.mode = 0;    // idle again
                    }
                    
                    

                }

            }

            entity.hurtSince += (1.0 - entity.hurtSince) *0.04;

            entity.vx *= 0.93;
            entity.vy *= 0.93;

            entity.x += entity.vx;
            entity.y += entity.vy;
        }
        //^ end of health>0



    }
    //^ end of update pass


    
    // if health is 0 or smaller, remove it i guess?
    for(let j = CUG.entities.length-1;j > -1;j--){

        let entity = CUG.entities[j];


        // DEATH CODE ---------------------
        // CODE TO RUN WHEN DEATH

        if( entity.health <= 0 ){

            // if you have a target entity, that means you are in their list
            if( entity.targetEntity){
                for(let g = entity.targetEntity.seedlists.length-1;g > -1;g--){
                    if(entity.targetEntity.seedlists[g] === entity){
                        entity.targetEntity.seedlists.splice( g, 1 );
                    }
                }
            }

            // if the dead entity is an emeny
            if( entity.type === ENTITY_ENEMY ){

                // release seedlings from enemy list in an explost vi eway
                for(let g = entity.seedlists.length-1;g > -1;g--){

                    entity.seedlists[g].targetEntity = null;

                    if(entity.seedlists[g].type === ENTITY_SEEDLING){

                        playAudio("balop")

                        // set to idle?
                        //entity.targetEntity.seedlists[g].mode = 0;

                        // set to go back to player wiht a little push off
                        entity.seedlists[g].mode = 1;// captured now as a follower back to the player
                        player.seedlists.push( entity.seedlists[g] );
                        let anglePushBack = Math.atan2( 
                            entity.y-entity.seedlists[g].y,
                            entity.x-entity.seedlists[g].x
                        );
                        entity.seedlists[g].vx += 15*Math.cos(anglePushBack);
                        entity.seedlists[g].vy += 15*Math.sin(anglePushBack);
                    } 
                }
            }
            

            // Finally remove from the 
            CUG.entities.splice( j, 1 );
            if(entity.type === ENTITY_ENEMY){
                
                // Go through enemies 
                for(let c = CUG.enemies.length-1;c > -1;c--){
                    if(CUG.enemies[c] === entity){
                        CUG.enemies.splice( c, 1 );
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
            let ssze = 17; // size of a seedling
        
            // Determine color transition based on hurtSince
            let hurtFactor = Math.max(0, Math.min(1, entity.hurtSince)); // Clamped between 0 and 1
            let baseColor = { r: 0, g: 128, b: 0 }; // Green
            let hurtColor = { r: 0, g: 255, b: 0 }; // Brighter green
        
            // Interpolate between baseColor and hurtColor
            let r = Math.round(baseColor.r + (hurtColor.r - baseColor.r) * hurtFactor);
            let g = Math.round(baseColor.g + (hurtColor.g - baseColor.g) * hurtFactor);
            let b = Math.round(baseColor.b + (hurtColor.b - baseColor.b) * hurtFactor);
        
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.moveTo(entity.x, entity.y - ssze);
            ctx.lineTo(entity.x - ssze, entity.y + ssze);
            ctx.lineTo(entity.x + ssze, entity.y + ssze);
            ctx.closePath();
            ctx.fill();

            // Flip horiziontal values
            if(entity.vx < 0 && Math.abs(entity.vx) > 0.6 ){
                entity.horFlip += (1 - entity.horFlip) * 0.1;
            }
            else{
                entity.horFlip += (0 - entity.horFlip) * 0.1;
            }

            // speed magnitude
            let speeMag = Math.hypot( entity.vx, entity.vy );


            // Apply squash/stretch effect
            // let scaleX = 1 + Math.sin(time * 0.2) * 0.2; // Horizontal stretch
            // let scaleY = 1 - Math.sin(time * 0.2) * 0.2; // Vertical squash
            // ctx.scale(scaleX, scaleY);
            let wx = 160;
            wx /= 4;
            let wy = 192;
            wy /= 4;

            let sqush = 7 * ( Math.sin(CUG.step/8 +(entity.offr)) );

            let totalwy = wy + sqush;
              


            let flipProgress = entity.horFlip; // Between 0 and 1



            // Calculate the width dynamically based on flip progress
            let scaledWidth = wx * Math.abs(1 - 2 * flipProgress);
            let flipDirection = flipProgress >= 0.5 ? -1 : 1;

            let xOffs = flipDirection < 0 ? -wx : 0;

            ctx.save();
            ctx.translate(entity.x, entity.y + totalwy / 2);

            // Apply horizontal flipping based on the flip progress
            ctx.scale(flipDirection, 1);
            
            ctx.drawImage(
                ALL_IMAGES.seedling, 
                (-scaledWidth / 2) * flipDirection + xOffs, // Adjust x based on flipping
                -wy / 2, // Keep the vertical position centered
                scaledWidth, 
                totalwy
            );

            ctx.restore();
             
        } 
        else if (entity.type === ENTITY_ENEMY) {

            
            let hurtFactor = Math.max(0, Math.min(1, entity.hurtSince));
            let baseColor = { r: 139, g: 0, b: 0 }; // Dark red (hurt)
            let hurtColor = { r: 255, g: 0, b: 0 }; // Bright red

            // Just lidling
            if( entity.mode === 0 ){
                hurtColor = { r: 255, g: 200, b: 200 };
            }
        
            let r = Math.round(baseColor.r + (hurtColor.r - baseColor.r) * hurtFactor);
            let g = Math.round(baseColor.g + (hurtColor.g - baseColor.g) * hurtFactor);
            let b = Math.round(baseColor.b + (hurtColor.b - baseColor.b) * hurtFactor);
        
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, 15, 0, Math.PI * 2);
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
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);
    ctx.drawImage(background, 0, 0, 2048, 2048);

    renderAllEntities();

    // Reverse the translation manually
    ctx.translate(-(canvas.width / 2 - camera.x), -(canvas.height / 2 - camera.y));


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