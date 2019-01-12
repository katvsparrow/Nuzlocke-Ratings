const request = require('request');

const url = process.env.LOGIN_URL || 'http://localhost:3001';
const key = process.env.KEY || 'key';

module.exports = {
  register: (username, password, callback) => {
    request.put(
      url,
      { json: { key, username, password } },
      (error, response) => {
        callback(error, response ? response.statusCode : null);
      }
    );
  },

  login: (username, password, callback) => {
    request.get(
      url,
      { json: { key, username, password } },
      (error, response) => {
        callback(error, response ? response.statusCode : null);
      }
    );
  },

  delete: (username, password, callback) => {
    request.delete(
      url,
      { json: { key, username, password } },
      (error, response) => {
        callback(error, response ? response.statusCode : null);
      }
    );
  }
};
