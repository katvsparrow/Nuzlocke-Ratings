const express = require('express');

const app = express();
const { response } = app;

response.renderPage = function(page, title, data) {
  this.render('template-page.ejs', {
    page,
    player: this.locals.player,
    title,
    ...data
  });
};

response.renderAccessDenied = function() {
  this.status(403).renderPage('errors/access-denied.ejs', 'Access Denied');
};

response.renderNotFound = function() {
  this.status(404).renderPage('errors/not-found.ejs', 'Not Found');
};

response.renderError = function() {
  this.status(500).renderPage('errors/error.ejs', 'Error');
};

module.exports = app;
