const { spawn } = require("child_process");

const ls = spawn("ss", ["-OHrtupn"]);
var os = require('os');
var whoisJson = require('whois');

var cmdOutput = "";
var connections = [];

ls.stdout.on("data", data => {
    cmdOutput += data;
});

ls.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

ls.on("close", code => {
    //console.log(`child process exited with code ${code}`);
    formatOutput(cmdOutput);
    //table.setData({headers: ['col1', 'col2', 'col3', 'col1', 'col2', 'col3', 'col1', 'col2', 'col3', "in"], data: connections});
    //console.log(connections);
});

function formatOutput(data) {
	let outputLines = data.split(os.EOL);
	for (let i = 0; i < outputLines.length; i++) {
	  line = outputLines[i].split(" ").filter(n => n);
	  if (line.length == 0) {continue;}

	  connections.push([]);
	  connections[i].push(line[0]);
	  connections[i].push(line[1]);
	  connections[i].push(line[2]);
	  connections[i].push(line[3]);
	  let local = line[4].match("([^\:]+)\:")[1];
	  if (local.length > 25){
	  	connections[i].push(local.substring(0, 23)+"...");
	  	}
	  else{
	  connections[i].push(local);
	  }
	  connections[i].push(line[4].match("\:([0-9]+)")[1]);
	  let peer = line[5].match("([^\:]+)\:")[1];
	  	  if (peer.length > 25){
	  	  	connections[i].push(peer.substring(0, 23)+"...");
	  	  	}
	  	  else{
	  	  connections[i].push(peer);
	  	  }
	  connections[i].push(line[5].match("([^\:]+)\:")[1]);
	  connections[i].push(line[5].match("\:([0-9]+)")[1]);
	  if (line.length < 7) {
	  	//connections[i]["process"] = "";
	  	continue;
	  }
	  connections[i].push(line[6].match("\"([^\"]+)\"")[1]);
	  connections[i].push(line[6].match("pid\=([0-9]+)")[1]);
	} 
}

var blessed = require('blessed');
var contrib = require('blessed-contrib')

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'my window title';

var box = blessed.box({
  top: 0,
  left: 15,
  width: '50%',
  height: '100%',
  content: 'Hello {bold}world{/bold}!',
  mouse: true,
  tags: true,
  keys: true,
  interactive: true,
  screen: screen,
  vi: true,
  scrollable: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
   focus: {
   	bg: 'red'
   	}
    },
});

var box2 = blessed.box({
  parent: box,
  top: 20,
  left: 0,
  width: '30%',
  height: '30%',
  content: 'BOX 2',
  mouse: true,
  tags: true,
  interactive: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
 focus: {
 	bg: 'red'
 	}
 	},

});
var box3 = blessed.box({
  parent: box,
  top: 20,
  left: 50,
  width: '30%',
  height: '30%',
  content: 'BOX 3',
  mouse: true,
  tags: true,
  interactive: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
 focus: {
 	bg: 'red'
 	}
 	  },

});
var box4= blessed.box({
  parent: box,
  top: 60,
  left: 30,
  width: '30%',
  height: '30%',
  content: 'BOX 4',
  mouse: true,
  tags: true,
  interactive: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
 focus: {
 	bg: 'red'
 	}
 	  },

});

// Append our box to the screen.
screen.append(box);
box.append(box2);
box.append(box3);
box.append(box4);
// Focus our element.
box.focus();

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


box.on('keypress', function(data) {
    box.children[2].focus();
    
    console.log(box.focused)
    }
  );

// Render the screen.
screen.render();
