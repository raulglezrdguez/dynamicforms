
var usersController = function (server, usersDb) {

	server.post('/api/signin', function(req, res) {
		usersDb
			.find({email: req.body.user, password: req.body.pass}, function(error, users){
		  if (error) return res.status(400).send({code: 400, message: error});
		  if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

		  var token = utils.guid();

		  usersDb.update({_id: users[0]._id}, {$set: {token}}, {multi: false}, function(error, numReplaced) {
			if (error) return res.status(400).send({code: 400, message: error});

			return res.json({signedIn: true, name: users[0].name, token: token, rol: users[0].rol, id: users[0]._id});
		  });
		});
	});

	server.post('/api/signout/:token', function(req, res) {
		var token = req.params.token;
		if (token && token.trim() && token !== 'undefined') {
		usersDb.update({ token }, {$set: {token: ''}}, {multi: true}, function(error, numReplaced){
		  if (error) return res.status(400).send({code: 400, message: error});

		  return res.json({ status: 'ok' });
		});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.get('/api/getUsers', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					usersDb.find({}).sort({name: 1}).exec(function(err, usrs) {
						if (err) return res.status(400).send({code: 400, message: err});
						
						var users = usrs.map(function(u) {return ({id: u._id, value: u.name});});
						return res.json({users});
					});
				});
		} else {
			//return res.json({users: []});
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.get('/api/getUsersPage', function(req, res) {
		var token = '';
		if (req.query.token)
			token = req.query.token;
		
		var limit = 0;
		if (req.query.limit) limit = req.query.limit;
		var skip = 0;
		if (req.query.skip) skip = req.query.skip;
		
		if (token !== '') {
			usersDb
				.find({token}, function(error, usr){
					if (error) return res.status(400).send({code: 400, message: error});
					if (usr.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					usersDb.count({}, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err});
						
						if (limit === 0) limit = count;
						
						usersDb.find({}).skip(skip).limit(limit).exec(function(errr, usrs) {
							if (errr) return res.status(400).send({code: 400, message: errr});
							
							var users = usrs.map(function(u) {return ({email: u.email, name: u.name, rol: u.rol, date: u.date, _id: u._id});});

							return res.json({count: count, users});
						});
					});
				});
		} else {
			//return res.json({users: []});
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
	
	server.post('/api/addUser/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var name = req.body.name;
					var email = req.body.email;
					var password = req.body.password;
					var rol = req.body.rol;
					
					if ((name && name.trim() && name !== 'undefined') && 
						(email && email.trim() && email !== 'undefined') && 
						(password && password.trim() && password !== 'undefined') && 
						(rol && rol.trim() && rol !== 'undefined')
						){
							// verifico que el usuario no exista
							usersDb.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr});
								if (usrs.length !== 0) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								var date = Date.now();
				
								usersDb.insert({name, email, password, rol, date}, function(err, user){
									if (err) return res.status(400).send({code: 400, message: err});
									return res.json({ user });
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

	server.post('/api/updUserPass/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var id = req.body.id;
					var name = req.body.name;
					var email = req.body.email;
					var password = req.body.password;
					var rol = req.body.rol;
					
					if ((id && id.trim() && id !== 'undefined') && 
						(name && name.trim() && name !== 'undefined') && 
						(email && email.trim() && email !== 'undefined') && 
						(password && password.trim() && password !== 'undefined') && 
						(rol && rol.trim() && rol !== 'undefined')
						){
							
							usersDb.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr});
								if ((usrs.length === 1) && (usrs[0]._id !== id)) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								var date = Date.now();
				
								usersDb.update({_id: id}, {name, email, password, rol, date}, {}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err});
									
									usersDb.persistence.compactDatafile();
									
									return res.json({ user: {_id: id, name, email, rol, date} });
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

	server.post('/api/updUser/', function(req, res) {
		var token = req.body.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var id = req.body.id;
					var name = req.body.name;
					var email = req.body.email;
					var rol = req.body.rol;
					
					if ((id && id.trim() && id !== 'undefined') && 
						(name && name.trim() && name !== 'undefined') && 
						(email && email.trim() && email !== 'undefined') && 
						(rol && rol.trim() && rol !== 'undefined')
						){
							
							usersDb.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr});
								if ((usrs.length === 1) && (usrs[0]._id !== id)) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								var date = Date.now();
							
								usersDb.update({_id: id}, {$set: {name, email, rol, date}}, {}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err});
									
									usersDb.persistence.compactDatafile();
									
									return res.json({ user: {_id: id, name, email, rol, date} });
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

	server.delete('/api/delUser/:token/:id', function(req, res) {
		var token = req.params.token;
		
		if (token && token.trim() && token !== 'undefined') {
			
			usersDb
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});
					
					var id = req.params.id;
					
					if (id && id.trim() && id !== 'undefined'){
						// verifico que el usuario no se elimine a si mismo
						if (users[0]._id === id) {
							return res.status(400).send({code: 400, message: 'Imposible eliminar su propio usuario'});
						}
						
						usersDb.remove({_id: id}, {}, function(err, numRemoved){
							if (err) return res.status(400).send({code: 400, message: err});
							
							return res.json({ 'ok': true });
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

module.exports = usersController;
