var rimraf = require('rimraf');
rimraf('../out', function(err) {
    if (err) {
        console.log('Error while removing out: ' + err.toString());
    }
    console.log('out directory removed');
    rimraf('../docs', function (err) {
        if (err) {
            console.log('Error while removing doc: ' + err.toString());
        }
        console.log('docs directory removed');
    });
});

