var spawn = require('child_process').spawn;
var waitOn = require('wait-on');

var target = process.argv[2];

var waitOpts = {
  resources: [target],
  timeout: 60000
};

waitOn(waitOpts, function(err) {
  if (err) {
    console.error('home-inspector failed to wait on ' + target);
    process.exit(1);
  } else {
    console.log('Running home-inspector');
    var child = spawn('casperjs', ['test', '/usr/src/home-inspector/lib/links.js', '--target=' + target], {
      stdio: 'inherit'
    });

    child.on('exit', process.exit);

    process.on('SIGINT', function() {
      if (child) {
        child.kill();
      }
      process.kill();
    });
  }
});
