var lastSort: any;
var lastScroll: any;
var ascending = false;

export function retrieveSocket(socket: any, data: string, currentIndex: number) {
  if (socket == null) {
    return currentIndex;
  }

  let i = 0;
  while (i < data.length) {
    let l: any = data[i];
    let s: any = socket;

    if (s.inode != "0" && s.inode == l.inode) {
      currentIndex = i;
      break;
    } else if (
      s.localAddress == l.localAddress &&
      s.localPort == l.localPort &&
      s.peerAddress == l.peerAddress &&
      s.peerPort == l.peerPort
    ) {
      currentIndex = i;
      break;
    }
    i++;
  }

  return currentIndex;
}

export function sortBy(column: number | null, data: string[]) {
  if (column == null && lastSort == null) {
    return data;
  } else if (column == null) {
    column = lastSort;
  } else if (lastSort == column) {
    ascending = !ascending;
  }

  lastSort = column;

  const sort = (key: string, numeric = false) => {
    if (ascending && numeric) {
      data.sort((a: string, b: string) => (parseInt(a[key]) > parseInt(b[key]) ? 1 : -1));
    } else if (!ascending && numeric) {
      data.sort((a: string, b: string) => (parseInt(a[key]) < parseInt(b[key]) ? 1 : -1));
    } else if (key == "users" && ascending) {
      data.sort((a: string, b: string) => (a[key].text > b[key].text ? 1 : -1));
    } else if (key == "users") {
      data.sort((a: string, b: string) => (a[key].text < b[key].text ? 1 : -1));
    } else if (ascending) {
      data.sort((a: string, b: string) => (a[key] > b[key] ? 1 : -1));
    } else {
      data.sort((a: string, b: string) => (a[key] < b[key] ? 1 : -1));
    }
  };

  switch (column) {
    case 0:
      sort("protocol");
      break;
    case 1:
      sort("state");
      break;
    case 2:
      sort("receiveQueue", true);
      break;
    case 3:
      sort("sendQueue", true);
      break;
    case 4:
      sort("localAddress");
      break;
    case 5:
      sort("localPort", true);
      break;
    case 6:
      sort("peerAddress");
      break;
    case 7:
      sort("peerPort", true);
      break;
    case 8:
      sort("users");
      break;
  }

  return data;
}

export function getScroll(row: number, screenLines: number) {
  if (lastScroll === undefined) {
    lastScroll = [0, screenLines - 1];
  }

  let newScroll: number[] | null = null;
  let diff: number;

  if (row >= lastScroll[0] && row < lastScroll[1]) {
    newScroll = lastScroll;
  } else if (row < lastScroll[0]) {
    diff = lastScroll[0] - row;
    newScroll = [lastScroll[0] - diff, lastScroll[1] - diff];
  } else if (row >= lastScroll[1]) {
    diff = row - lastScroll[1] + 1;
    newScroll = [lastScroll[0] + diff, lastScroll[1] + diff];
  }

  lastScroll = newScroll;
  return newScroll;
}
