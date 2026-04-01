// Changes CWD to frontend/ then hands off to craco (which wraps react-scripts).
process.chdir(__dirname + '/frontend');
process.argv[1] = __dirname + '/frontend/node_modules/@craco/craco/dist/bin/craco.js';
process.argv.splice(2, 0, 'start');
require('./frontend/node_modules/@craco/craco/dist/bin/craco.js');
