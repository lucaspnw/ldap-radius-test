#!/usr/bin/env node

/*
Simple radius client test script
Call with -u <username> -p <password> <target server>
*/

const yargs = require('yargs');
const argv = yargs
  .option('username', {
    alias: 'u',
    describe: 'Username to use in the user_name field in the RADIUS Access-Request packet',
    type: 'string',
    demandOption: 'Username must be specified'
  })
  .option('password', {
    alias: 'p',
    describe: 'Password to use in the authenticator field in the RADIUS Access-Request packet',
    type: 'string',
    demandOption: 'Password must be specified'
  })
  .option('radius_secret', {
    describe: 'RADIUS Client Secret to use. Defaults to "password"',
    type: 'string',
    default: 'password'  
  })
  .command('target', 'Destination for the RADIUS packet', { alias: "server"})
  .example("$0 -u brit -p 12345 10.2.3.4", 'Send RADIUS Access-Request as brit with password 12345 to 10.2.3.4')
  .usage("Usage: $0 <target server> -u <username> -p <password>")
  .required(1, "Target server is required") 
  .argv
;


console.log(argv);

//process.exit();
var target = argv._[ 0 ];


const Client = require('node-radius-client');
const {
  dictionaries: {
    rfc2865: {
      file,
      attributes,
    },
  },
} = require('node-radius-utils');
 
const client = new Client({
  host: target,
  dictionaries: [
    file,
  ],
});
 
client.accessRequest({
  secret: argv.radius_secret,
  attributes: [
    [attributes.USER_NAME, argv.username],
    [attributes.USER_PASSWORD, argv.password],
    [attributes.NAS_IP_ADDRESS, '10.2.3.4'],
  ],
}).then((result) => {
  console.log('result', result);
}).catch((error) => {
  console.log('error', error);
});

