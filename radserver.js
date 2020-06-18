#!/usr/bin/env node

var radius = require('radius');
var dgram = require("dgram");

const yargs = require('yargs');
const argv = yargs
  .option('radius_secret', {
    describe: 'RADIUS Client Secret to use. Defaults to "password"',
    type: 'string',
    default: 'password'
  })
  .option('challenge_reply', {
    describe: 'RADIUS Challenge-Reply text.',
    type: 'string',
    default: 'Speak friend and enter'
  })
  .option('port', {
    describe: 'Port to listen on.',
    default: 1812,
    type: 'string'
  })
  .command('target', 'Destination for the RADIUS packet', { alias: "server"})
  .example("$0", 'Listen for RADIUS Access-Request on 0.0.0.0')
  .usage("Usage: $0 [--radius_secret <radius secret>]")
  .argv
;


var target = argv._[ 0 ];


var secret = argv.radius_secret;
var server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
	  var code, username, password, packet;
	  packet = radius.decode({packet: msg, secret: secret});

	  if (packet.code != 'Access-Request') {
		      console.log('unknown packet type: ', packet.code);
		      return;
          }

	  username = packet.attributes['User-Name'];
	  password = packet.attributes['User-Password'];

	  console.log('Access-Request, u:p: ' + username + ':' + password);

          var attributes = [];
	  if (password.includes('good') || password.includes('friend') || password.includes('mellon') ) {
	    code = 'Access-Accept';
          } 
          else if (password.includes('bad')) {
	    code = 'Access-Reject';
	  }
          else if (password.includes('challenge')) {
            code = 'Access-Challenge';
            stateBuffer = Buffer.from([0,1,2,3,4,5]);
            attributes = [ [ 'Reply-Message', argv.challenge_reply ], [ 'State', stateBuffer ] ];
          }
          else {
	    console.log('password didnt match good, bad, or challange. Sending reject.');
            code = 'Access-Reject';
          }

	  var response = radius.encode_response({
		      packet: packet,
		      code: code,
		      secret: secret,
                      attributes
		    });

	  console.log('Sending ' + code + ' for user ' + username);
	  server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
		      if (err) {
			            console.log('Error sending response to ', rinfo);
			          }
		    });
});

server.on("listening", function () {
	  var address = server.address();
	  console.log("radius server listening " +
		        address.address + ":" + address.port);
          console.log("This server responds differently depending on the password provided. 'good' = Access-Accept, 'bad' = Access-Reject, 'challenge' = Access-Challenge.\n");
});

server.bind(1812);
