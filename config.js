var config = {}

config.web = {};
config.web.port = 443;
config.web.host = 'localhost';

config.upload = {};
config.upload.files = './build/dyfiles/';
config.upload.images = './build/dyimages/';

config.admins = [
{
	name: 'Raúl Glez Rdguez',
	email: 'raul@correo.cu',
	password: 'raulin',
	rol: 'administrator', // administrator || client
	modules: ['all'], // all, moduleId...
	token: ''
},
{
	name: 'Administrador',
	email: 'admon@correo.cu',
	password: 'administrador',
	rol: 'administrator',
	modules: ['all'],
	token: ''
}
];

config.modules = [
{
	name: 'Comun',
	desc: 'Datos comunes a los modulos'
},
{
	name: 'Prueba',
	desc: 'Para hacer pruebas al sistema'
}
];

module.exports = config;
