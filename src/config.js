const fs = require('node:fs');

class Config {
  // can't use private properties with proxies 😿
  _customServer;
  _gameName;
  _playerName = 'The Unknown Netrisser';
  _speed = 0.5 * 1000;

  get customServer() {
    return this._customServer;
  }

  set customServer(customServer) {
    this._customServer = customServer;
  }

  get gameName() {
    return this._gameName;
  }

  set gameName(gameName) {
    if (!gameName) {
      throw new Error('game name is required');
    }
    this._gameName = gameName;
  }

  get playerName() {
    return this._playerName;
  }

  set playerName(playerName) {
    if (playerName) {
      this._playerName = playerName;
    }
  }

  get speed() {
    return this._speed;
  }

  set speed(speed) {
    this._speed = speed;
  }

  save() {
    try {
      fs.writeFileSync(configFile, JSON.stringify(this));
    }
    catch (error) {  // eslint-disable-line no-unused-vars
      // debug(error)
    }
  }
};

const configFile = 'netrisse.config';
const config = new Config();

try {
  const savedConfig = JSON.parse(fs.readFileSync(configFile));
  Object.assign(config, savedConfig);
}
catch (error) {  // eslint-disable-line no-unused-vars
  // debug(error)
}

const handler = {
  set(target, property, value) {
    target[property] = value;
    target.save();
    return true;
  },
};

module.exports = new Proxy(config, handler);
