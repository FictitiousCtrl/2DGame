// Run this using "node compile.js" before double clicking index.html
// to smoosh all the resources into a single file

const fs = require('fs');
const path = require('path');

function getAudioFilesBase64(folderPath) {
    const audioFiles = [];
    const allowedExtensions = ['.mp3', '.wav', '.ogg'];

    try {
        const files = fs.readdirSync(folderPath);
        
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const ext = path.extname(file).toLowerCase();
            
            if (allowedExtensions.includes(ext)) {
                const fileNameWithoutExt = path.basename(file, ext);
                const fileBuffer = fs.readFileSync(filePath);
                const base64String = fileBuffer.toString('base64');
                
                audioFiles.push({
                    name: fileNameWithoutExt,
                    data: 'data:audio/ogg;base64,' + base64String
                });
            }
        });

        return JSON.stringify(audioFiles, null, 2);
    } catch (err) {
        console.error("Error reading files:", err);
        return null;
    }
}

// Define the paths for the files
const hostFilePath = path.resolve(__dirname, 'src/start.js');
const outputFilePath = path.resolve(__dirname, 'build/built.js');

//const file3Path = path.resolve(__dirname, 'file3.js'); // Optional file

try {
    // Read the host file synchronously
    let hostFileContent = fs.readFileSync(hostFilePath, 'utf8');
 
    //const file3Content = fs.existsSync(file3Path) ? fs.readFileSync(file3Path, 'utf8') : '';

    // Replace the special keywords in the host file
    hostFileContent = hostFileContent.replace(`// !!!!! do -NOT MODIFY- this line - it is where entities.js is inserted !!!!!`, 
        '' + fs.readFileSync(path.resolve(__dirname, 'src/entities.js'), 'utf8')
    ); 

    // if (file3Content) {
    //     hostFileContent = hostFileContent.replace('/* FILE_3 */', file3Content);
    // }

    // Write the final content to the output file
    fs.writeFileSync(outputFilePath, hostFileContent, 'utf8');

    console.log('File compiled successfully! Output written to:', outputFilePath, `\nYou can open index.html now`);

    
    // Save files 
    const folderPath = path.resolve( __dirname, 'assets/sounds' );//'./audio_files'; // Change this to your folder containing audio files
    const jsonString = getAudioFilesBase64( folderPath );
    if (jsonString) { 
        fs.writeFileSync( path.resolve(__dirname, 'build/sounds64.js'), 
        'var ALL_SOUNDS = ' + jsonString, 'utf8');
    }


} catch (error) {
    console.error('An error occurred:', error.message);
}


