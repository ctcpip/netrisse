module.exports = class Game {
  pauses = []; // array of player ids
  boards = [];
  started = false;

  constructor(interval, algorithm, client, currentPlayerID) {
    this.interval = interval;
    this.algorithm = algorithm;
    this.client = client;
    this.currentPlayerID = currentPlayerID;
  }

  pause(isPausing, playerID, isRemote) {
    const previousPauses = this.pauses.length;

    if (isPausing) {
      // add pause
      this.pauses.push(playerID);
    }
    else {
      // remove pause
      for (let i = 0; i < this.pauses.length; i++) {
        const p = this.pauses[i];

        if (p === playerID) {
          this.pauses.splice(i, 1);
          break;
        }
      }
    }

    this.boards[0].setPauseText();

    if (this.pauses.length === 0 && previousPauses > 0) {
      if (!this.started) {
        this.started = true;
        this.start();
      }

      this.togglePauseBoard(isRemote);
    }
    else if (previousPauses === 0 && this.pauses.length > 0) {
      this.togglePauseBoard(isRemote);
    }
  }

  togglePauseBoard(isRemote) {
    // no need to call pause() on the other player boards
    this.boards[0].pause(isRemote);
  }

  get isPaused() {
    return this.pauses.length > 0;
  }

  get isPausedByThisPlayer() {
    return this.pauses.includes(this.currentPlayerID);
  }

  start() {
    for (const b of this.boards) {
      b.startNewShape();
    }
  }

  sendJunk(junkLines) {
    let toBoard;

    switch (this.boards.length) {
      case 1:
        return;
      case 2:
        // if only two players, then junk lines always go to the other player
        toBoard = this.boards[1];
        break;
      default: {
        let lowestBoardY = 0;

        // give junk to player with the lowest board pieces

        // skip main board (index 0)
        for (let i = 1; i < this.boards.length; i++) {
          const b = this.boards[i];

          const lowestY = b.getHighestOccupiedPoint();

          if (lowestY > lowestBoardY) {
            lowestBoardY = lowestY;
            toBoard = b;
          }
        }

        break;
      }
    }

    this.client.sendMessage({ junkLines, toPlayerID: toBoard.playerID }, this.client.messageTypeEnum.JUNK);
    toBoard.receiveJunk(junkLines);
  }
};
