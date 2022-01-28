var Datastore = require('../node_modules/nedb')
  , modulesDb = new Datastore({ filename: './database/modules.db', autoload: true })
  , config = require("../config");

modulesDb.remove({}, { multi: true });

modulesDb.insert(config.modules, function(error, modules) {
  modulesDb.persistence.compactDatafile();

  if (error) console.log(error);
  else {
    console.log('Modulos adicionados correctamente');

    modulesDb.on('compaction.done', function() {
      console.log('completado');

      process.exit();

    });
  }

})
