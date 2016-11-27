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
  , scale = require('d3-scale')
  , values = require('lodash.values')

Metalsmith(__dirname)
  .source('./src')
  .destination('./healthy-school-buildings')
  .clean(true)
  .use(csv({
    files:[
      'data/school-conditions.csv',
      'data/lead-samples-2016.csv',
      'data/lead-samples-2010.csv'
    ]
  }))
  .use(function (files, metalsmith, next) {
    // Remove invalid data from old 2010 csv
    var md = metalsmith.metadata()
      , s = scale.scaleThreshold().domain([3, 5, 10, 15, 20])
                                  .range(['Less than 3', '3 - 5', '5 - 10', '10 - 15', '15 - 20', 'More than 20'])

      , actives = md['school-conditions'].map(function (s) {
                                           return s['ULCS Code']
                                         })
    md['lead-samples-2010'] = md['lead-samples-2010'].filter(function (l) {
      // Remove invalid samples; as well as samples part of a ULCS that we never long have
      return l.valid == 'true' && actives.indexOf(l.ulcs) !== -1
    })

    md['lead-samples-2016'] = md['lead-samples-2016'].map(function (sample) {
      // Normalize to match old data
      sample.ulcs = sample.ULCS
      sample.name = sample['School Name']
      sample.id = sample['Outlet ID #']
      var result = sample['Test Result (ppb)']
      if (result.indexOf('<') === 0) {
        result = result.substring(1)
      }
      sample.lead = result
      return sample
    })

    md['lead-summary-2010'] = values(md['lead-samples-2010'].reduce(function (p, c) {
      if (!p[c.name]) {
        p[c.name] = {
          collected: 0,
          ulcs: c.ulcs,
          name: c.name,
          year: 2010
        }
        s.range().forEach(function (r) {
          p[c.name][r] = 0
        })
      }
      p[c.name].collected++
      p[c.name][s(c.lead)]++
      return p
    }, {}))

    // Add summary data
    md['lead-summary-2016'] = values(md['lead-samples-2016'].reduce(function (p, c) {
      if (!p[c.name]) {
        p[c.name] = {
          collected: 0,
          ulcs: c['ULCS'],
          year: 2016,
          name: c.name
        }
        s.range().forEach(function (r) {
          p[c.name][r] = 0
        })
      }
      p[c.name].collected++
      p[c.name][s(c.lead)]++
      return p
    }, {}))


    next()
  })
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
