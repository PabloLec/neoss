let lastSort: number;
let lastScroll: any;
let ascending = false;

/**
 * Try to retrieve previously selected line after table refresh.
 *
 * @param socket - Socket object to be retrieved
 * @param data - Refreshed table data to be parsed
 * @param currentIndex - Current selected line number, returned if no match
 * @returns Line number to be highlighted
 */
export function retrieveSocket(socket: any, data: string, currentIndex: number): number {
  if (socket == null) {
    return currentIndex;
  }

  let i = 0;
  while (i < data.length) {
    let l: any = data[i];
    let s: any = socket;

    let isSameInode = s.inode != "0" && s.inode == l.inode
    let isSameOtherParams = s.localAddress == l.localAddress &&
        s.localPort == l.localPort &&
        s.peerAddress == l.peerAddress &&
        s.peerPort == l.peerPort

    if (isSameInode || isSameOtherParams) {
      currentIndex = i;
      break;
    }
    i++;
  }

  return currentIndex;
}

function sortColumn(data: string[], key: string, numeric = false) {
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
}

/**
 * Handle socket sort.
 *
 * @param column Currently selected column
 * @param data Table data
 * @returns Sorted data
 */
export function sortBy(column: number | null, data: string[]): string[] {
  if (column == null && lastSort == null) {
    return data;
  } else if (column == null) {
    column = lastSort;
  } else if (lastSort == column) {
    ascending = !ascending;
  }

  lastSort = column;

  

  switch (column) {
    case 0:
      sortColumn(data, "protocol");
      break;
    case 1:
      sortColumn(data,  "state");
      break;
    case 2:
      sortColumn(data,  "receiveQueue", true);
      break;
    case 3:
      sortColumn(data,  "sendQueue", true);
      break;
    case 4:
      sortColumn(data,  "localAddress");
      break;
    case 5:
      sortColumn(data,  "localPort", true);
      break;
    case 6:
      sortColumn(data,  "peerAddress");
      break;
    case 7:
      sortColumn(data,  "peerPort", true);
      break;
    case 8:
      sortColumn(data,  "users");
      break;
  }

  return data;
}

/**
 * Get lines index range to be displayed after scroll.
 *
 * @param row - Currently selected line index
 * @param screenLines - Complete array of table lines
 * @returns - Lines index range to be displayed
 */
export function getScroll(row: number, screenLines: number): number[] {
  if (lastScroll === undefined) {
    lastScroll = [0, screenLines - 1];
  }

  let newScroll = lastScroll;
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
