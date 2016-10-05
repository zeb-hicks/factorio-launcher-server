'use strict';

var fs = require('fs');
var zip = require('adm-zip');
var path = require('path');

var express = require('express');
var app = express();
var http = require('http').Server(app);

var serverConfigObject = {};

app.get('/', (req, res) => {
	res.json(serverConfigObject);
	res.end();
});

app.get('/mods/:mod.zip', (req, res) => {
	res.sendFile(path.join(__dirname, 'mods', req.params.mod + '.zip'));
});

http.listen('8767');

function loadServerConfig() {
	try {
		// Read the config file.
		var cfg = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
		// Parse the JSON.
		var o = JSON.parse(cfg);
		// Assign the data from the file to the config state object.
		Object.assign(serverConfigObject, o);
	} catch (err) {
		console.log('Unable to load and parse the server configuration.', err);
	}
}

function updateModList() {
	var mods = [];
	fs.readdir(path.join(__dirname, 'mods'), (err, files) => {
		try {
			serverConfigObject.mods.length = 0;
			if (err) {
				files = [];
			}
			for (let i = 0; i < files.length; i++) {
				// Decompress the mod zip file.
				let mz = new zip(path.join(__dirname, 'mods', files[i]));
				// Store the folder name for the mod zip file.
				let fname = files[i].replace('.zip', '');
				// Extract and parse the info.json from the mod and push it onto the mod list.
				serverConfigObject.mods.push(JSON.parse(mz.readAsText(fname + '/info.json')));
			}
		} catch (err) {
			console.log('Error attempting to decompress and read mod file(s).', err);
		};
	});
}

loadServerConfig();
updateModList();