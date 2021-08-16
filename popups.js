var blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));

var currentBox = null;

var protocolText = {
  udp: "User Datagram Protocol (UDP) is a connectionless protocol that works just like TCP but assumes that error-checking and recovery services are not required. Instead, UDP continuously sends datagrams to the recipient whether they receive them or not.",
  tcp: "Transmission Control Protocol (TCP) is a connection-oriented protocol that computers use to communicate over the internet. It is one of the main protocols in TCP/IP networks. TCP provides error-checking and guarantees delivery of data and that packets will be delivered in the order they were sent.",
};

var stateText = {
  CLOSED: " There is no connection.",
  LISTEN:
    " The local end-point is waiting for a connection request from a remote end-point i.e. a passive open was performed.",
  "SYN-SENT":
    " The first step of the three-way connection handshake was performed. A connection request has been sent to a remote end-point i.e. an active open was performed.",
  "SYN-RECEIVED":
    " The second step of the three-way connection handshake was performed. An acknowledgement for the received connection request as well as a connection request has been sent to the remote end-point.",
  ESTAB: " The third step of the three-way connection handshake was performed. The connection is open.",
  "FIN-WAIT-1":
    " The first step of an active close (four-way handshake) was performed. The local end-point has sent a connection termination request to the remote end-point.",
  "CLOSE-WAIT":
    " The local end-point has received a connection termination request and acknowledged it e.g. a passive close has been performed and the local end-point needs to perform an active close to leave this state.",
  "FIN-WAIT-2":
    " The remote end-point has sent an acknowledgement for the previously sent connection termination request. The local end-point waits for an active connection termination request from the remote end-point.",
  "LAST-ACK":
    " The local end-point has performed a passive close and has initiated an active close by sending a connection termination request to the remote end-point.",
  CLOSING:
    " The local end-point is waiting for an acknowledgement for a connection termination request before going to the TIME-WAIT state.",
  "TIME-WAIT":
    " The local end-point waits for twice the maximum segment lifetime (MSL) to pass before going to CLOSED to be sure that the remote end-point received the acknowledgement.",
};

var queueText = {
  receiveQueue:
    "Established: The count of bytes not copied by the user program connected to this socket.\nListening: Since Kernel 2.6.18 this column contains the current syn backlog.",
  sendQueue:
    "Established: The count of bytes not acknowledged by the remote host.\nListening: Since Kernel 2.6.18 this column contains the maximum size of the syn backlog.",
};

function removePopup(screen) {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
  }
  screen.render();
}

function createPopup(popup, screen) {
  currentBox = popup;
  currentBox.key(["enter", "escape"], function (ch, key) {
    removePopup(screen);
  });
  screen.append(currentBox);
  screen.render();
}

function handlePopup(screen, column, content) {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
    screen.render();
    return;
  }

  content = content.trim();
  switch (column) {
    case 0:
      createPopup(textPopup(protocolText[content]), screen);
      break;
    case 1:
      createPopup(textPopup(stateText[content]), screen);
      break;
    case 2:
      createPopup(textPopup(queueText["receiveQueue"]), screen);
      break;
    case 3:
      createPopup(textPopup(queueText["sendQueue"]), screen);
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    case 8:
      break;
  }
}

function textPopup(content) {
  return blessed.box({
    top: "center",
    left: "center",
    width: "50%",
    height: "50%",
    content: content,
    tags: true,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "magenta",
      border: {
        fg: "#f0f0f0",
      },
      hover: {
        bg: "green",
      },
    },
  });
}

module.exports = { handlePopup };
