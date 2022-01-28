var formsController = function (server, usersDb, formsDb, refreshFormContentDb) {

	// devuelve las forms del owner
	server.get('/api/getForms', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		var limit = 0;
		if (req.query.limit) limit = req.query.limit;
		var skip = 0;
		if (req.query.skip) skip = req.query.skip;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var filter = {};
					if (req.query.module) {
						filter = { $and: [{ owner: users[0]._id }, { module: req.query.module }] };
					} else {
						filter.owner = users[0]._id;
					}
					
					formsDb.count(filter, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err});
						
						if (limit === 0) limit = count;
						
						formsDb.find(filter).skip(skip).limit(limit).exec(function(errr, forms) {
							if (errr) return res.status(400).send({code: 400, message: errr});

							return res.json({count: count, forms});
						});
					});
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	// devuelve las forms en que puede introducir datos el usuario
	server.get('/api/getFormsXClient', function(req, res) {
		
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var _id = users[0]._id;
					var filter = { users: { $in: ['all', _id] }};
					
					formsDb.find(filter, function(errr, forms) {
						if (errr) return res.status(400).send({code: 400, message: errr});

						return res.json({forms});
					});
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	// devuelve las forms que puede ver el usuario
	server.get('/api/getFormsView', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var _id = users[0]._id;
					var filter = { viewers: { $in: ['public', 'all', _id] }};
					
					formsDb.find(filter, function(errr, forms) {
						if (errr) return res.status(400).send({code: 400, message: errr});

						return res.json({forms});
					});
				});
		} else {
			var filter = { viewers: { $in: ['public', 'all'] }};
		
			formsDb.find(filter, function(errr, forms) {
				if (errr) return res.status(400).send({code: 400, message: errr});

				return res.json({forms});
			});
		}
	});

	server.post('/api/addForm/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var owner = users[0]._id;

					var name = req.body.name;
					var desc = req.body.desc;
					var usrs = JSON.parse(req.body.usrs);
					var viewers = JSON.parse(req.body.viewers);
					var fields = JSON.parse(req.body.fields);
					var module = req.body.module;
					
					if ((name && name.trim() && name !== 'undefined') && 
						(desc && desc.trim() && desc !== 'undefined') && 
						(module && module.trim() && module !== 'undefined') && 
						(usrs && usrs.length > 0) && 
						(viewers && viewers.length > 0) && 
						(fields && fields.length > 0)){
							var date = Date.now();
				
							formsDb.insert({owner, name, desc, module, users: usrs, viewers, fields, date}, function(err, form){
								if (err) return res.status(400).send({code: 400, message: err});
								
								refreshFormContentDb();
								
								return res.json({ form });
							});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.post('/api/updForm/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var owner = users[0]._id;

					var id = req.body.id;
					var name = req.body.name;
					var desc = req.body.desc;
					var module = req.body.module;
					var usrs = JSON.parse(req.body.usrs);
					var viewers = JSON.parse(req.body.viewers);
					var fields = JSON.parse(req.body.fields);
					
					if ((id && id.trim() && id !== 'undefined') && 
						(name && name.trim() && name !== 'undefined') && 
						(desc && desc.trim() && desc !== 'undefined') && 
						(module && module.trim() && module !== 'undefined') && 
						(usrs && usrs.length > 0) && 
						(viewers && viewers.length > 0) && 
						(fields && fields.length > 0)){
							var date = Date.now();

							formsDb.update({_id: id}, {owner, name, desc, module, users: usrs, viewers, fields, date}, {}, function(err, numReplaced){
								if (err) return res.status(400).send({code: 400, message: err});
								
								formsDb.persistence.compactDatafile();
								
								refreshFormContentDb();
								
								return res.json({ form: {_id: id, owner, name, desc, module, users: usrs, viewers, fields, date} });
							});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.delete('/api/delForm/:token/:id', function(req, res) {
		var token = req.params.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var id = req.params.id;
					
					if (id && id.trim() && id !== 'undefined'){
						// busco que el formulario no tenga alguna relacion
						formsDb.find({}, function(err, forms) {
							if (err) return res.status(400).send({code: 400, message: err});
							
							var relation = false;
							for(var i = 0; i < forms.length; i++){
								var fieldsCount = forms[i].fields.length;
								for(var j = 0; j < fieldsCount; j++) {
									// que el form no tenga alguna ref
									if ((forms[i].fields[j].type==="ref") && (forms[i].fields[j].values.indexOf(id) === 0)) {
										relation = true;
										
										break;
									}
								}
								if (relation) break;
							}
							
							if (relation) return res.json({ 'ok': false });
							
							formsDb.remove({_id: id}, {}, function(err, numRemoved){
								if (err) return res.status(400).send({code: 400, message: err});
								
								refreshFormContentDb();
								
								return res.json({ 'ok': true });
							});
						});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
};

module.exports = formsController;
