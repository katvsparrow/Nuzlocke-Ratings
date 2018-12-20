const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

const { getHomePage } = require('./routes/index');
const {
    addPlayerPage,
    addPlayer,
    deletePlayer,
    editPlayer,
    editPlayerPage
} = require('./routes/player');
const { addRunPage, addRun, displayRuns } = require('./routes/run');
const {
    overallInfo,
    basegameInfo,
    ruleInfo,
    titleInfo
} = require('./routes/info');
const port = 3000;

const { JAWSDB_URL } = process.env;
const connection = JAWSDB_URL
    ? JAWSDB_URL
    : {
          host: 'localhost',
          user: 'root',
          password: 'rootroot',
          database: 'nrs',
          multipleStatements: true
      };
const db = mysql.createConnection(connection);

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.set('port', process.env.port || port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.get('/', getHomePage);
app.get('/add', addPlayerPage);
app.get('/add-run', addRunPage);
app.get('/edit/:id', editPlayerPage);
app.get('/delete/:id', deletePlayer);
app.get('/:id/runs', displayRuns);
app.get('/info', overallInfo);
app.get('/info/basegames', basegameInfo);
app.get('/info/rules', ruleInfo);
app.get('/info/titles', titleInfo);

app.post('/add', addPlayer);
app.post('/add-run', addRun);
app.post('/edit/:id', editPlayer);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
