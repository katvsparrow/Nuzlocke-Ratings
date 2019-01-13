const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const route = {
  index: require('./routes/index'),
  player: require('./routes/player'),
  run: require('./routes/run'),
  info: require('./routes/info'),
  challenge: require('./routes/challenge'),
  title: require('./routes/title')
};
const db = require('./db');
const logger = require('./logger');

const app = require('./custom-express');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// session for maintaining logins
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'allhailgoomy',
    store: db.sessionStore,
    resave: false,
    saveUninitialized: false
  })
);

// keep track of logged in player
app.use((req, res, next) => {
  res.locals.player = req.session.player;
  next();
});

app.get('/', route.index.homePage);

app
  .route('/register')
  .get(route.player.registerPage)
  .post(route.player.register);

app
  .route('/login')
  .get(route.player.loginPage)
  .post(route.player.login);

app.get('/logout', (req, res) => {
  delete req.session.player;
  res.redirect('/');
});

app
  .route('/add-run')
  .get(route.run.addRunPage)
  .post(route.run.addRun);

app
  .route('/edit/:username')
  .get(route.player.editPlayerPage)
  .post(route.player.editPlayer);

app
  .route('/add-challenge/:challengeID')
  .get(route.challenge.addChallengePage)
  .post(route.challenge.addChallenge);

app
  .route('/add-title/:titleID')
  .get(route.title.addTitlePage)
  .post(route.title.addTitle);

// app.get('/delete/:username', deletePlayer);
app.get('/profile/:username', route.player.playerProfile);

app.get('/:username/display-runs', route.run.displayRuns);

app.get('/:username/display-challenges', route.challenge.displayChallenges);

app.get('/info', route.info.overallInfo);
app.get('/info/basegames', route.info.basegameInfo);
app.get('/info/rules', route.info.ruleInfo);
app.get('/info/titles', route.info.titleInfo);
app.get('/info/viability', route.info.viabilityInfo);
app.get('/info/challenges', route.info.challengeInfo);
app.get('/getting-started', route.info.walkthroughInfo);
app.get('/credits', route.info.creditsPage);

// all unlisted routes go here to display not found
app.use((req, res) => {
  res.renderNotFound();
});

// error handling middleware should always be last
app.use((err, req, res, next) => {
  // if a response was already sent, go to built-in Express error handler
  if (res.headersSent) {
    return next(err);
  }

  res.renderError();
  logger.error(err);
});

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Nuzlocke Ratings server running on port ${port}`);
});
