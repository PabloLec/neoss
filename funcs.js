const { spawn } = require("child_process");

const ls = spawn("ss", ["-OHrtupn"]);
var os = require("os");
var whoisJson = require("whois");

var cmdOutput = "";
var connections = {};

ls.stdout.on("data", (data) => {
  cmdOutput += data;
});

ls.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

ls.on("error", (error) => {
  console.log(`error: ${error.message}`);
});

ls.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
  //formatOutput(cmdOutput);
  //console.log(connections);
});

function formatOutput(data) {
  let outputLines = data.split(os.EOL);
  for (let i = 0; i < outputLines.length; i++) {
    line = outputLines[i].split(" ").filter((n) => n);
    if (line.length == 0) {
      continue;
    }

    connections[i] = {};
    connections[i]["protocol"] = line[0];
    connections[i]["state"] = line[1];
    connections[i]["rx"] = line[2];
    connections[i]["tx"] = line[3];
    connections[i]["localIP"] = line[4].match("([^:]+):")[1];
    connections[i]["localPort"] = line[4].match(":([0-9]+)")[1];
    connections[i]["peerIP"] = line[5].match("([^:]+):")[1];
    connections[i]["peerPort"] = line[5].match(":([0-9]+)")[1];
    if (line.length < 7) {
      //connections[i]["process"] = "";
      continue;
    }
    connections[i]["process"] = line[6].match('"([^"]+)"')[1];
    connections[i]["pid"] = line[6].match("pid=([0-9]+)")[1];
  }
}

// TODO: catch les erreurs, les not found, et parser un minimum
whois = (server) => {
  return new Promise((resolve, reject) => {
    whoisJson.lookup(server, { verbose: true }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};
//
//whois("142.250.184.238").then(console.log);
