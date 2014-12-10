exports = require('./src/qwe');

for (var k in exports) {
    if (exports.hasOwnProperty(k))
        console.log(k);
}