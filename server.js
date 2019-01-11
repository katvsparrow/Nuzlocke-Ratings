const express = require('express');
const fileUpload = require('express-fileupload');
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

const port = process.env.PORT || 3000;

const app = express();
app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
// session for maintaining logins
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'allhailgoomy',
    store: db.sessionStore,
    resave: false,
    saveUninitialized: false
  })
);

// keep this middleware at the end, add any other middleware above this
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    req.app.locals.error(req, res, error);
  }
});

// helper function to render a page, useful for standardizing all pages
app.locals.render = (req, res, page, data) => {
  res.render('template-page.ejs', {
    player: req.session.player,
    page,
    ...data
  });
};

// helper function to show an error page if an error occurs
app.locals.error = (req, res, err) => {
  app.locals.render(req, res.status(500), 'error.ejs', {
    title: 'Nuzlocke Ratings | Error'
  });
  logger.error(err);
};

// helper function to show access denied page
app.locals.forbidden = (req, res) => {
  app.locals.render(req, res.status(403), 'forbidden.ejs', {
    title: 'Nuzlocke Ratings | Access Denied'
  });
  logger.log(
    'Access denied for ' +
      req.session.player.username +
      ' accessing ' +
      req.path
  );
};

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
