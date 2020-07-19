const fs = require('fs-extra');
const childProcess = require('child_process');
const { default: logger } = require('./src/shared/Logger');


try {
    // Remove current build
    fs.removeSync('./dist/');
    // Copy front-end files
    fs.copySync('./src/public', './dist/public');
    fs.copySync('./src/views', './dist/views');
    // Transpile the typescript files
    childProcess.exec('tsc --build tsconfig.prod.json');
} catch (err) {
    logger.error(err);
}