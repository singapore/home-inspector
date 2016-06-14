
var checked = [];
var baseCheckCount = [];
var currentLink = 0;
var maxDepth = 100;
var maxURLsPerBase = 5;
var baseUrl = casper.cli.options.target;
var links = [baseUrl];
var utils = require('utils');

var OK = 200;
var badRequest = 400;

if (!baseUrl) {
  casper.warn('No url passed, aborting.').exit(1);
}

/**
 * Generic error checkers
 */

casper.on('page.error', function(msg, trace) {
  this.echo('Error:    ' + msg, 'ERROR');
  this.echo('file:     ' + trace[0].file, 'WARNING');
  this.echo('line:     ' + trace[0].line, 'WARNING');
  this.echo('function: ' + trace[0].function, 'WARNING');
  casper.test.fail(msg);
});

function baseCheck(base) {
  if (!base) {
    return false;
  }
  var baseSplit = base.split('/').slice(0, -1);
  var minimumLength = 4;
  if (baseSplit.length < minimumLength) {
    return true;
  }
  base = baseSplit.join('/');
  if (typeof baseCheckCount[base] === 'undefined') {
    baseCheckCount[base] = 1;
    return true;
  }
  var baseCount = baseCheckCount[base];
  baseCheckCount[base] = baseCount + 1;
  return baseCount < maxURLsPerBase;
}

// Clean links
function cleanLinks(urls) {
  return utils.unique(urls).filter(function(url) {
    return url.indexOf(baseUrl) === 0 || /^\//.test(url);
  }).filter(function(url) {
    return checked.indexOf(url) === -1;
  });
}

// Opens the page, perform tests and fetch next links
function crawl(link) {
  var waitVal = 1000;
  checked.push(link);
  this.start(link);
  this.wait(waitVal);
  this.then(function() {
    return casper.test.assertHttpStatus(OK, link + ' return 200');
  });
  this.then(function() {
    // wait until no pending resources;
    casper.waitFor(function() {
      return this.resources.filter(function(r) {
        return r.stage !== 'end';
      }).length === 0;
    });
  });
  this.then(function() {
    var failedResources = this.resources
      .filter(function(r) {
        return r.url.indexOf(baseUrl) === 0;
      })
      .filter(function(r) {
        return !r.status || r.status >= badRequest;
      });

    casper.each(failedResources, function(self, resource) {
      casper.test.fail('Status ' + resource.status + ' for ' + resource.url);
    });

    if (!failedResources.length) {
      casper.test.pass('Loaded all ' + this.resources.length + ' resources for page ' + link);
    }
  });
  this.then(function() {
    var newLinks = searchLinks.call(this);
    links = links.concat(newLinks).filter(function(url) {
      return checked.indexOf(url) === -1;
    });
  });
}

// Fetch all <a> elements from the page and return
// the ones which contains a href starting with 'http://'
function searchLinks() {
  return cleanLinks(this.evaluate(function() {
    return [].map.call(document.querySelectorAll('a[href]'), function(a) {
      return a.protocol + '//' + a.host + a.pathname + a.search + a.hash;
    });
  }));
}

// As long as it has a next link, and is under the maximum limit, will keep running
function check() {
  var currentURL = links[currentLink];
  while (currentURL && baseCheck(currentURL) === false) {
    currentURL = links[++currentLink];
  }
  if (currentURL && currentLink < maxDepth) {
    crawl.call(this, currentURL);
    currentLink++;
    this.run(check);
  } else {
    casper.test.done();
    this.echo('All done, ' + checked.length + ' links checked.');
  }
}

casper.start().then(function() {
  this.echo('Starting');
}).run(check);
