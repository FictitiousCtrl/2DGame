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