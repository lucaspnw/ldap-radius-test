#!/usr/bin/env node
var ldap = require('ldapjs');



const yargs = require('yargs');
const argv = yargs
  .option('attributes', {
    alias: 'a',
    describe: 'Attributes to return to the client as the search result, ex: -o \'{ dn: \'o=example\', controls: [] }\'',
    type: 'string',
    default: { objectclass: ['organization', 'top'], o: 'example' }
  })
  .option('port', {
    alias: 'p',
    describe: 'Port to bind on.',
    type: 'string',
    default: 389
  })
  .wrap(null)
  .example("$0", 'Run LDAP server on port 389')
  .usage("Usage: $0 [-p <port>] [-a <LDAP Search Result>]")
  .argv
;

var server = ldap.createServer();

server.bind('', function(req, res, next) {
  console.log('Got LDAP Bind Request' + req.dn.toString() + ' PW: ' + req.credentials);
  console.log('Sending OK.');
  res.end();
});

server.search('o=example', function(req, res, next) {
  console.log('Got LDAP Search Request: ' + req.toString());
  
  var obj = {
    dn: req.dn.toString(),
    attributes: {
      objectclass: ['organization', 'top'],
      o: 'example'
    }
  };

  //if (req.filter.matches(obj.attributes))
    console.log('Sending: ' + JSON.stringify(obj) );
    res.send(obj);

  res.end();
});

server.listen(argv.port, function() {
  console.log('LDAP server listening at %s', server.url);
});
