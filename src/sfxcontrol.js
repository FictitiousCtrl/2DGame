console.log('ALL_SOUNDS:');
console.log( ALL_SOUNDS );

function base64ToArrayBuffer(base64) {
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

    try {
        const binaryString = atob(cleanBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    catch (error) {
        console.error('Failed to decode Base64 string:', base64, error);
        return null;
    }
}

// Initialize the audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Iterate through all keys in sfxBase64
for(let u = 0;u < ALL_SOUNDS.length;u++){
    const base64String = ALL_SOUNDS[u].data;//sfxBase64[key].base64;
    const arrayBuffer = base64ToArrayBuffer(base64String);

    if (arrayBuffer) {
        audioContext.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            // Store the decoded AudioBuffer
            ALL_SOUNDS[u].buffer = decodedBuffer;
            console.log(`AudioBuffer successfully decoded for ${ALL_SOUNDS[u].name}`);
        }, (error) => {
            console.error(`Error decoding audio data for ${ALL_SOUNDS[u].name}:`, error);
        });
    } else {
        console.error(`Failed to create ArrayBuffer for ${ALL_SOUNDS[u].name}`);
    }
};
 

var canplayAudio = false; // Global variable

function fileToBase64(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

function unlockAudioContext() {
    if( canplayAudio === false){
        
        //requestHIDAccess();
    }
    canplayAudio = true; // Update global variable
    
    // if (audioContext.state === 'suspended') {
    //     audioContext.resume().then(() => {
    //         console.log('AudioContext resumed');
    //     }).catch((error) => {
    //         console.error('Failed to resume AudioContext:', error);
    //     });
    // }
}


// Example: Playing an audio file
function playAudio(key) {

    let ind = -1;
    for(let k = 0;k < ALL_SOUNDS.length;k++){
        if(ALL_SOUNDS[k].name === key){
            ind= k;
            k = ALL_SOUNDS.length;
        }
    }

    if (ALL_SOUNDS[ind].buffer instanceof AudioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = ALL_SOUNDS[ind].buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } else {
        console.error(`AudioBuffer for ${ALL_SOUNDS[ind].name} is not available or invalid.`);
    }
}
