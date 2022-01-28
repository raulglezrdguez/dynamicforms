var Datastore = require('../node_modules/nedb')
  , usersDb = new Datastore({ filename: './database/users.db', autoload: true })
  , config = require("../config");

usersDb.remove({}, { multi: true });

usersDb.insert(config.admins, function(error, admins) {
  usersDb.persistence.compactDatafile();

  if (error) console.log(error);
  else {
    console.log('Administradores adicionados correctamente');

    usersDb.on('compaction.done', function() {
      console.log('completado');

      process.exit();

    });
  }

})
