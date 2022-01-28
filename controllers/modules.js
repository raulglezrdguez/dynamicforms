var modulesController = function (server, usersDb, modulesDb, formsDb) {

	server.get('/api/getModules', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					modulesDb.find({}).sort({name: 1}).exec(function(err, modules) {
						if (err) return res.status(400).send({code: 400, message: err});
						return res.json({modules});
					});
				});
		} else {
			return res.json({modules: []});
		}
	});
	
	server.get('/api/getAllModules', function(req, res) {
		modulesDb.find({}).sort({name: 1}).exec(function(err, modules) {
			if (err) return res.status(400).send({code: 400, message: err});
			return res.json({modules});
		});
	});
	
	server.get('/api/getModulesPage', function(req, res) {
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
					
					modulesDb.count({}, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err});
						
						if (limit === 0) limit = count;
						
						modulesDb.find({}).skip(skip).limit(limit).sort({name: 1}).exec(function(errr, modules) {
							if (errr) return res.status(400).send({code: 400, message: errr});
							
							return res.json({count: count, modules});
						});
					});
				});
		} else {
			return res.json({modules: []});
		}
	});
	
	server.post('/api/addModule/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var owner = users[0]._id;

					var name = req.body.name;
					var desc = req.body.desc;
					
					if ((name && name.trim() && name !== 'undefined') && 
						(desc && desc.trim() && desc !== 'undefined') 
						){
							// verifico que el module no exista
							modulesDb.find({name: name}, function(errr, mdls){
								if (errr) return res.status(400).send({code: 400, message: errr});
								if (mdls.length !== 0) return res.status(400).send({code: 400, message: 'Modulo ya existe'});

								modulesDb.insert({owner, name, desc}, function(err, module){
									if (err) return res.status(400).send({code: 400, message: err});
									
									return res.json({ module });
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
	
	server.post('/api/updModule/', function(req, res) {
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
					
					if ((id && id.trim() && id !== 'undefined') && 
						(name && name.trim() && name !== 'undefined') && 
						(desc && desc.trim() && desc !== 'undefined') 
						){
							modulesDb.find({name: name}, function(errr, mdls){
								if (errr) return res.status(400).send({code: 400, message: errr});
								if ((mdls.length === 1) && (mdls[0]._id !== id)) return res.status(400).send({code: 400, message: 'Modulo ya existe'});

								modulesDb.update({_id: id}, {$set: {owner, name, desc}}, {}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err});
									
									modulesDb.persistence.compactDatafile();
									
									return res.json({ module: {_id: id, owner, name, desc} });
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

	
	server.delete('/api/delModule/:token/:id', function(req, res) {
		var token = req.params.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var id = req.params.id;
					
					if (id && id.trim() && id !== 'undefined'){
						// verifico que el modulo no se este usando en alguna form
						formsDb.find({module: id}, function(errr, forms) {
							if (errr) return res.status(400).send({code: 400, message: errr});
							if (forms.length > 0) return res.status(400).send({code: 400, message: 'El modulo esta en uso'});
							
							modulesDb.remove({_id: id}, {}, function(err, numRemoved){
								if (err) return res.status(400).send({code: 400, message: err});
								
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
}

module.exports = modulesController;