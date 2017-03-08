#!/usr/bin/env node

'use strict';

const program = require('commander'),
	path = require('path'),
	fs = require('fs-extra'),
	_	= require('lodash'),
	chalk = require('chalk'),
	spawn = require('cross-spawn'),
	inquirer = require('inquirer'),
	git = require('gitclone'),
	version = require('../package.json').version;

let currentPath = path.join( path.dirname( fs.realpathSync(__filename) ),  '../' );

//console.log( process.argv, process.cwd() );

console.log(chalk.blue.bold(' 🌈🌈🌈 MailRender 🌈🌈🌈 '));

const run = (args = []) => {
	spawn('gulp', args, {
		cwd: currentPath,
		env: {
			NODE_PATH: path.join(process.cwd(), path.sep)
		},
		stdio: 'inherit'
	});
}

program
	.version(version)
	.usage('[command] --options');

program
	.command('run [cmd]')
	.description('run gulp')
	.option('-n, --no', 'Don\'t open browser tab')
	.option('-p, --production', 'Run in production mode')
	.action((command, options) => {
		let args = [];

		if ( command ) args.push(command);
		if ( options.no ) args.push('--no');
		if ( options.production ) args.push('--production');

		//console.log(args);

		run(args);
	});

program
	.command('init')
	.alias('start')
	.description('create project')
	.action(() => {

		inquirer.prompt([
			{
				name: 'key',
				message: 'Chave única do projeto:',
				default: '20170101_mail_render'
			},
			{
				name: 'title',
				message: 'Título do email:',
				default: 'Title'
			},
			{
				name: 'url',
				message: 'Url base:',
				default: 'http://google.com.br'
			},
			{
				name: 'html',
				message: 'Quantidade de htmls:',
				default: 1
			},
			{
				name: 'template',
				message: 'Usar template base:',
				default: 'jussilabs/mailrender-template-compracerta'
			},
			{
				name: 'run',
				type: 'confirm',
				message: 'Iniciar automaticamente ?',
				default: true
			}
		])
		.then(answers => {

			if ( answers.template && answers.template.indexOf('mailrender-template') !== -1 ) {

				console.log( answers.template );

				fs.removeSync('template');
				
				return git(answers.template, {
					ssh: true,
					dest: 'template'
				}, (err) => {
					if ( err ) {
						return console.error('git-clone error:', err);
					}

					let metadata = fs.readJsonSync('template/metadata.json');

					if ( metadata ) {
						metadata.default.key = answers.key;
						metadata.default.title = answers.title;

						fs.outputJson('metadata.json', metadata);
					}
					
					fs.move('template/src', 'src', { overwrite: true }, () => {
						fs.remove('template');

						if ( answers.run ) run();
					} );
				});

			} else {
				fs.copySync(path.join(currentPath, 'src'), 'src');

				const jsonPath = path.join(currentPath, 'metadata.json');

				let metadata = _.template( fs.readFileSync(jsonPath) )(answers);

				metadata = JSON.parse(metadata);

				if ( answers.html > 1 ) {
					_.times(answers.html, i => {
						metadata[`email-${i + 1}`] = _.pick(metadata.default, ['url', 'params']);
					});
				}

				fs.outputJsonSync('metadata.json', metadata);

				if ( answers.run ) run();
			}
			
		});

	});

program.parse(process.argv);

if ( ! program.args.length ) {
	program.help(chalk.cyan);
}