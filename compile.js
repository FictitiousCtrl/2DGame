// Run this using "node compile.js" before double clicking index.html
// to smoosh all the resources into a single file

const fs = require('fs');
const path = require('path');

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
} catch (error) {
    console.error('An error occurred:', error.message);
}
