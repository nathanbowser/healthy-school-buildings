var csv = require('metalsmith-csv')
  , sass = require('metalsmith-sass')
  , Metalsmith = require('metalsmith')
  , watch = require('metalsmith-watch')
  , layouts = require('metalsmith-layouts')
  , inplace = require('metalsmith-in-place')
  , markdown = require('metalsmith-markdown')
  , metadata = require('metalsmith-metadata')
  , browserify = require('metalsmith-browserify')
  , permalinks = require('metalsmith-permalinks')

Metalsmith(__dirname)
  .source('./src')
  .destination('./healthy-school-buildings')
  .clean(true)
  .use(csv({
    files:[
      'data/school-conditions.csv',
      'data/lead-samples-2016.csv',
      'data/lead-summary-2016.csv'
    ]
  }))
  .use(inplace({
    engine: 'liquid',
    partials: 'templates/includes'
  }))
  .use(metadata({
    site: 'data/site.json'
  }))
  .use(markdown())
  .use(function (files, metalsmith, next) {
    var metadata = metalsmith.metadata()
      , detail = files['lead-detail.html']
      , byUlcs = metadata['lead-samples-2016'].reduce(function (p, c) {
                   if (p[c.ULCS]) {
                     p[c.ULCS].push(c)
                   } else {
                     p[c.ULCS] = [c]
                   }
                   return p
                 }, {})

    Object.keys(byUlcs).forEach(function (ulcs) {
      files['lead/' + ulcs + '.html'] = {
        contents: '',
        layout: 'lead-detail.liquid',
        data: byUlcs[ulcs],
        name: byUlcs[ulcs][0]['School Name'],
        ulcs: ulcs
      }
    })

    next()
  })
  .use(permalinks({
    pattern: ':title',
    relative: false
  }))
  .use(browserify({
    dest: 'js/bundle.js',
    args: ['src/js/index.js']
  }))
  .use(layouts({
    engine: 'liquid',
    directory: 'templates/layouts',
    includeDir: 'templates/includes'
  }))
  .use(sass({
    outputStyle: 'expanded'
  }))
  .use(watch({
    paths: {
      'src/**/*': '**/*',
      'templates/**/*': '**/*'
    }
  }))
  .build(function (err) {
    if (err) {
      throw err
    }
  })
