module.exports = function(screen, mainBoardPosition, game, client) {
  if (game) {
    for (const b of game.boards) {
      b.stopAutoMoveTimer();
    }
    game.boards[0].quit();
  }

  clearTimeout(screen.timeDisplayTimeout);

  screen.term.moveTo(mainBoardPosition.left + 1, mainBoardPosition.bottom + 1);
  screen.term.eraseLine();
  screen.term.hideCursor(false);
  // writeDebugInfo();

  if (client) {
    // add reject timeout
    client.ws.on('close', () => { // ensure we send disconnect to the server before we exit
      screen.term.grabInput(false); // stop listening for input so the process exits
    });

    client.disconnect();
  }
  else {
    screen.term.grabInput(false); // stop listening for input so the process exits
  }
};
