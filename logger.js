module.exports = {
  log: message => {
    console.log(new Date().toLocaleString('en-US') + ': ' + message);
  },

  error: message => {
    console.error(new Date().toLocaleString('en-US') + ': ' + message);
    console.trace();
  }
};
