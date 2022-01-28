var dyformsController = function (server, usersDb, formContentDbDatastore, config) {
	
	var fs = require('fs');
	var si = require('systeminformation');
		
	server.post('/api/addDyContent/', function(req, res) {
		
		var token = req.body.token;
		
		if (token && token.trim() && (token !== 'undefined')) {
			
			usersDb
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var owner = users[0]._id;
					var date = Date.now();

					var form = req.body.form;
					var fields = JSON.parse(req.body.fields);
					
					var dataStore = formContentDbDatastore(form);
					if (dataStore !== null) {
						dataStore.insert({owner, values: fields, date}, function(err, content){
							if (err) return res.status(400).send({code: 400, message: err});
							
							return res.json({ ok: true, content });
						});
					} else {
						return res.json({ok: false, message: 'No existe el data store'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	server.post('/api/updDyContent/', function(req, res) {
		
		var token = req.body.token;
		
		if (token && token.trim() && (token !== 'undefined')) {
			
			usersDb
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var owner = users[0]._id;
					var date = Date.now();

					var form = req.body.form;
					var id = req.body.id;
					var fields = JSON.parse(req.body.fields);
					
					var dataStore = formContentDbDatastore(form);
					if (dataStore !== null) {
						dataStore.update({_id: id}, {owner, values: fields, date}, {}, function(err, numReplaced){
							if (err) return res.status(400).send({code: 400, message: err});
							
							return res.json({ ok: true });
						});
					} else {
						return res.json({ok: false, message: 'No existe el data store'});
					}

				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	server.post('/api/addDyImage', function(req, res) {
		var multiparty = require('multiparty');
		var thumb = require('node-thumbnail').thumb;
		
		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
			if (err) console.log(err)
			
			
			var path = files.imageFile[0].path;
			var originalFilename = files.imageFile[0].originalFilename;
			//let {path, originalFilename} = files.imageFile[0];
			var fileExt = originalFilename.split('.').pop();
			var copyToPath = config.upload.images + fields.id[0] + '-' + fields.field[0] + '.' + fileExt;

			fs.readFile(path, function(err, data) {
				// make copy of image to new location
				fs.writeFile(copyToPath, data, function(err) {
					if (err) return res.send({ok: false, message: 'Error copiando archivo'});
					// delete temp image
					fs.unlink(path, function() {
						// create thumb
						var dest = config.upload.images + 'thumbnails/';
						thumb({
							source: copyToPath,
							destination: dest,
							width: 150,
							overwrite: true
						}).then(function() {
							return res.send({ok: true, copyToPath});
							//console.log('Success thumb');
						}).catch(function(e) {
							console.log('Error thumb: ', e.toString());
						});
					});
				}); 
			}); 
		});
	});
	
	server.post('/api/addDyFile', function(req, res) {
		var multiparty = require('multiparty');
		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
			if (err) console.log(err)
			
			var path = files.compressedFile[0].path;
			var originalFilename = files.compressedFile[0].originalFilename;
			var fileExt = originalFilename.split('.').pop();
			var copyToPath = config.upload.files + fields.id[0] + '-' + fields.field[0] + '.' + fileExt;

			fs.readFile(path, function(err, data) {
				// make copy of image to new location
				fs.writeFile(copyToPath, data, function(err) {
					if (err) return res.send({ok: false, message: 'Error copiando archivo'});
					// delete temp image
					fs.unlink(path, function() {
						return res.send({ok: true, copyToPath});
					});
				}); 
			}); 
		});
	});
	
	server.delete('/api/delDyContent/:token/:form/:id', function(req, res) {
		var token = req.params.token;
		
		if (token && token.trim() && (token !== 'undefined')) {
			
			usersDb
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var form = req.params.form;
					var id = req.params.id;
					
					if ((form && form.trim() && form !== 'undefined') && 
						(id && id.trim() && id !== 'undefined')){

						var dataStore = formContentDbDatastore(form);
						if (dataStore !== null) {
							dataStore.remove({_id: id}, {}, function(err, numRemoved){
								if (err) return res.status(400).send({code: 400, message: err});
								
								return res.json({ 'ok': true });
							});
						} else {
							return res.json({ok: false, message: 'No existe el data store'});
						}
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	// devuelve la lista de valores que contiene un formulario dinamico en un field
	server.get('/api/getDyList', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		if (token && token.trim() && (token !== 'undefined')) {
			usersDb
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var form = req.query.form;
					var field = req.query.field;
					
					if ((form && form.trim() && form !== 'undefined') && 
						(field && field.trim() && field !== 'undefined')){
							
						var dataStore = formContentDbDatastore(form);
						if (dataStore !== null) {
							dataStore.find({}, function(err, docs){
								if (err) return res.status(400).send({code: 400, message: err});
								
								var list = [];
								for(var j = 0; j < docs.length; j++) {
									if (docs[j] && docs[j].values) {
										for(var k = 0; k < docs[j].values.length; k++) {
											var id = docs[j]._id;
											var value = docs[j].values[k][field];
											if (id && value) {
												list.push({id, value});
											}
										}
									}
								}
								
								return res.json({ ok: true, list });
							});
						} else {
							return res.json({ok: false, message: 'No existe el data store'});
						}
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			var form = req.query.form;
			var field = req.query.field;
			
			if ((form && form.trim() && form !== 'undefined') && 
				(field && field.trim() && field !== 'undefined')){
					
				var dataStore = formContentDbDatastore(form);
				if (dataStore !== null) {
					dataStore.find({}, function(err, docs){
						if (err) return res.status(400).send({code: 400, message: err});
						
						var list = [];
						for(var j = 0; j < docs.length; j++) {
							if (docs[j] && docs[j].values) {
								for(var k = 0; k < docs[j].values.length; k++) {
									var id = docs[j]._id;
									var value = docs[j].values[k][field];
									if (id && value) {
										list.push({id, value});
									}
								}
							}
						}
						
						return res.json({ ok: true, list });
					});
				} else {
					return res.json({ok: false, message: 'No existe el data store'});
				}
			} else {
				return res.status(400).send({code: 400, message: 'Datos incorrectos'});
			}
		}
	});
	
	// devuelve el contenido de un formulario dinamico
	server.get('/api/getDyContent', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		var limit = 0;
		if (req.query.limit) limit = req.query.limit;
		var skip = 0;
		if (req.query.skip) skip = req.query.skip;
		
		if (token && token.trim() && (token !== 'undefined')) {
			usersDb
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var form = req.query.form;
					var owner = users[0]._id;
					var filter = {owner};
					
					if (form && form.trim() && form !== 'undefined'){

						var dataStore = formContentDbDatastore(form);
						if (dataStore !== null) {
							dataStore.count(filter, function(err, count){
								if (err) return res.status(400).send({code: 400, message: err});
								
								if (limit === 0) limit = count;
								
								dataStore.find(filter).skip(skip).limit(limit).sort({date: 1}).exec(function(errr, docs) {
									if (errr) return res.status(400).send({code: 400, message: errr});
									
									return res.json({ok: true, count: count, docs});
								});
							});
						} else {
							return res.json({ok: false, message: 'No existe el data store'});
						}

					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	server.get('/api/getDyData', function(req, res) {
		var limit = 0;
		if (req.query.limit) limit = req.query.limit;
		var skip = 0;
		if (req.query.skip) skip = req.query.skip;
		
		si.networkInterfaces(function(data) {
			if ((data[0] !== 'undefined') && (data[0].mac !== 'undefined')) {
				return res.json({count: 0, data: data[0]});
			} else {
				return res.json({count: 0, data: {}});
			}
		});
	});
	
	// devuelve el contenido de un formulario dinamico
	server.get('/api/getAllDyContent', function(req, res) {
		
		var limit = 0;
		if (req.query.limit) limit = req.query.limit;
		var skip = 0;
		if (req.query.skip) skip = req.query.skip;
		
		var form = req.query.form;
		var filter = {};
		
		if (form && form.trim() && form !== 'undefined'){

			var dataStore = formContentDbDatastore(form);
			if (dataStore !== null) {
				dataStore.count({}, function(error, count){
					if (error) return res.status(400).send({code: 400, message: error});
					
					if (limit === 0) limit = count;
					
					dataStore.find({}).skip(skip).limit(limit).sort({date: 1}).exec(function(errr, docs) {
						if (errr) return res.status(400).send({code: 400, message: errr});
						
						return res.json({ok: true, count: count, docs});
					});
				});
				
			} else {
				return res.json({ok: false, message: 'No existe el data store'});
			}
		} else {
			return res.status(400).send({code: 400, message: 'Datos incorrectos'});
		}
	});

};

module.exports = dyformsController;
