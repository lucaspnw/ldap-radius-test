#!/usr/bin/env node

// from http://ldapjs.org/client.html

const yargs = require('yargs');
const argv = yargs
  .option('dn', {
    alias: 'd',
    describe: 'DN to use in the LDAP Bind',
    type: 'string',
    demandOption: 'Client DN must be specified for the LDAP Bind with the -d option'
  })
  .option('password', {
    alias: 'p',
    describe: 'Password to use for the LDAP Bind',
    type: 'string',
    demandOption: 'Password must be specified'
  })
  .wrap(null)
  .command('client_url', 'Destination for the LDAP Bind connection', { alias: "c"})
  .example("$0 -d CN=brit -p 123 ldap://10.2.3.4", 'Attempt LDAP Bind with CN=brit and password 12345 to 10.2.3.4')
  .usage("Usage: $0 -d <bind DN> -p <password> <target LDAP URL>")
  .required(1, "Target LDAP URL is required")
  .argv
;


//console.log(argv);

//process.exit();
var targetUrl = argv._[ 0 ];



var assert = require('assert')
var ldap = require('ldapjs');
var client = ldap.createClient({
  url: targetUrl
});


client.bind(argv.dn, argv.password, function(e) {
  assert.ifError(e);

  console.log('New client bind:');
  search(client, function(e) {
    console.log('search done');
    client.unbind(function(e) {
      assert.ifError(e);
      process.exit(0);;
    });
  });
  
});


function search(client,cb) { 

  var opts = {
    filter: '(&(l=Seattle)(email=*@foo.com))',
    scope: 'sub',
    attributes: ['dn', 'sn', 'cn']
  };

  client.search('o=example', opts, function(err, res) {
    assert.ifError(err);

    res.on('searchEntry', function(entry) {
      console.log('Search Result Entry:');
      console.log(entry.object);
    });
    res.on('searchReference', function(referral) {
      console.log('referral: ' + referral.uris.join());
    });
    res.on('error', function(err) {
      console.error('error: ' + err.message);
    });
    res.on('end', function(result) {
      console.log('status: ' + result.status);
      cb();
    });

  });

}
