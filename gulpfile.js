'use strict';

const gulp	= require('gulp'),
	$		= require('gulp-load-plugins')(),
	del		= require('del'),
	Uri		= require('jsuri'),
	juice	= require('juice'),
	_		= require('lodash'),
	fs		= require('fs-extra'),
	bs		= require('browser-sync');

$.juice	= require('premailer-gulp-juice');

let metadata, key; /* (KEY) NOME DA PASTA/PROJETO */

juice.styleToAttribute = {
	'width': 'width',
	'border': 'border',
	'background-color': 'bgcolor',
	'background-image': 'background',
	'vertical-align': 'valign',
	'dir': 'direction',
	'-jmr-align': 'align',
	'-jmr-cellpadding': 'cellpadding',
	'-jmr-cellspacing': 'cellspacing'
};

const path = process.env.NODE_PATH || '';

const paths = {
	metadata: path + 'metadata.json',
	templates: path + 'src/*.html',
	components: path + 'src/components/**/*.html',
	styles: path + 'src/styles/**/*.scss',
	images: path + 'src/images/**/*.{png,jpeg,jpg,svg,gif}',
	build: [ path + 'dist/**', path + '!dist/**/*.map', path + '!dist/**/*.css'],
	dest: {
		dist: path + 'dist',
		build: path + 'build'
	}
};

const options = {
	ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
	batch: path + 'src/components',
	helpers: {
		formatUrl: (url, options) => { //handlebar returns root object when helper is called without parameter
			options = options || url;
			url = new Uri( url && ! url.data ? url : options.data.root.url );
			_.each(options.data.root.params, (value, key) => url.replaceQueryParam(key, value));
			return url.toString();
		},

		formatImage: (img, options) => {
			return ( $.util.env.production && ! img.includes('http') ? ( options.data.root.path || '' ) + key + '-' : '') + img;
		},

		split: (options) => {
			if ( options.data.index + 1 % options.hash.nth === 0 ) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},

		add: (a, b) => a + b,

		subtract: (a, b) => a - b,

		divide: (a, b) => a / b,

		multiply: (a, b) => a * b,

		eq: (a, b) => a === b,

	}
};

gulp.task('metadata', () => {
	metadata = fs.readJsonSync(paths.metadata);
	key = metadata.default.key;
});

gulp.task('templates', (done) => {

	_.each(metadata, (value, key) => {

		const meta = _.merge({}, metadata.default, value);

		gulp.src(paths.templates)
			.pipe($.plumber())
			.pipe($.compileHandlebars(meta, options))
			.pipe($.rename(file => {
				file.basename = key === 'default' ? 'index' : key;
			}))
			.pipe(gulp.dest(paths.dest.dist))
			.pipe($.juice({
				webResources: {
					relativeTo: path + 'dist',
					images: 0
				}
			}))
			.pipe(gulp.dest(paths.dest.dist))
			//.pipe(bs.reload({ stream: true }));
			//.pipe(bs.stream({ once: true }));
			.pipe(bs.stream({ match: '**/index.html' }));
	});

	return $.util.env.production ? setTimeout(done, 500) : done();
});

gulp.task('styles', () => {
	return gulp.src(paths.styles)
		.pipe($.plumber())
		.pipe($.newer(paths.dest.dist))
		.pipe($.sass($.util.env.production ? {
			outputStyle: 'compressed',
		} : {}).on('error', $.sass.logError))
		.pipe(gulp.dest(paths.dest.dist));
});

gulp.task('images', () => {
	return gulp.src(paths.images)
		.pipe($.plumber())
		.pipe($.newer(paths.dest.dist))
		.pipe($.imagemin({
			optimizationLevel: $.util.env.production ? 5 : 1,
			progressive: true,
			interlaced: true
		}))
		.pipe($.rename( path => {
			if ( $.util.env.production ) {
				path.basename = key + '-' + path.basename;
			}
		} ))
		.pipe($.flatten())
		.pipe(gulp.dest(paths.dest.dist));
});

gulp.task('clean', () => del([paths.dest.dist], {
	force: true
}) );

gulp.task('zip', () => {
	return gulp.src(paths.build)
		.pipe($.zip(key + '.zip'))
		.pipe(gulp.dest(paths.dest.build));
});

gulp.task('serve', ['watch'], () => {
	bs({
		server: paths.dest.dist,
		open: !$.util.env.no
	});
});

gulp.task('watch', $.sequence('metadata', 'images', 'styles', 'templates', () => {
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.templates, ['templates']);
	gulp.watch(paths.components, ['templates']);
	gulp.watch(paths.metadata, ['metadata', 'templates']);

	gulp.watch(paths.styles, () => $.sequence('styles', 'templates')() );
}));

gulp.task('default', ['clean'], () => gulp.start('serve') );

gulp.task('deploy', ['clean'], () => {
	$.util.env.production = true;
	$.sequence('metadata', 'images', 'styles', 'templates', 'zip', process.exit);
});