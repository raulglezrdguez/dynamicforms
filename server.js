var https = require('https');
var fs = require('fs');
var key = fs.readFileSync('./key.pem');
var cert = fs.readFileSync('./cert.pem');
var https_options = {
    key: key,
    cert: cert
};

var config = require('./config');
var path = require('path');
var express = require('express');
var app = express();
//var server = require('http').Server(app);
var server = https.createServer(https_options, app);
var bodyParser = require('body-parser');

var port = config.web.port;
var host = config.web.host;

//cargo las funciones utiles: en global.utils.guid
require('./controllers/utils');

var Datastore = require('nedb')
  , usersDb = new Datastore({ filename: './database/users.db', autoload: true })
  , formsDb = new Datastore({ filename: './database/forms.db', autoload: true })
  , modulesDb = new Datastore({ filename: './database/modules.db', autoload: true });

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());


// inicio las formContentDb: [{formId, form, dataStore}] arreglo con los ids, nombres de las forms y los dataStores
var formContentDb = [];
refreshFormContentDb = function() {
	formContentDb = [];
	formsDb.find({}, function(error, forms) {
		if (error) console.log("Error refrescando formContentDb: " + error);
		else {
			for (var i = 0; i < forms.length; i++) {
				var f = './database/content/' + forms[i]._id + '.db';
				var dt = new Datastore({ filename: f, autoload: true });
				
				formContentDb.push({formId: forms[i]._id, form: forms[i].name, dataStore: dt});
			}
		}
	});
}
formContentDbDatastore = function(form) {
	var found = -1;
	for(var i = 0; i < formContentDb.length; i++) {
		if (formContentDb[i].formId === form) {
			found = i;
			
			break;
		}
	}
	
	if (found !== -1) return formContentDb[found].dataStore;
	else return null;
}

formsDb.find({}, function(error, forms) {
	if (error) console.log("Error iniciando formContentDb: " + error);
	else {
		for (var i = 0; i < forms.length; i++) {
			var f = './database/content/' + forms[i]._id + '.db';
			var dt = new Datastore({ filename: f, autoload: true });
			formContentDb.push({formId: forms[i]._id, form: forms[i].name, dataStore: dt});
		}
	}
});

//controllers
var usersController = require('./controllers/users');
var formsController = require('./controllers/forms');
var modulesController = require('./controllers/modules');
var dyformsController = require('./controllers/dyforms');

usersController(app, usersDb);
formsController(app, usersDb, formsDb, refreshFormContentDb);
modulesController(app, usersDb, modulesDb, formsDb);
dyformsController(app, usersDb, formContentDbDatastore, config);

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(port, host, function() {
	console.log(`Servidor corriendo en https://${host}:${port}`);
});
