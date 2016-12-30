var csv = require('metalsmith-csv')
  , slug = require('slug')
  , fs = require('fs')
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
  , d3 = require('d3')

Metalsmith(__dirname)
  .source('./src')
  .destination('./out')
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

    md.ppbThresholds = s.range()

    md['lead-samples-2016'] = md['lead-samples-2016'].map(function (sample) {
      // Normalize to match old data
      sample.ulcs = sample.ULCS
      sample.name = sample['School Name']
      sample.id = sample['Outlet ID #']
      var result = sample['Test Result (ppb)']
      if (result.indexOf('<') === 0) {
        result = result.substring(1)
      }
      if (result.indexOf('ND<') === 0) {
        result = result.substring(3)
      }
      sample.lead = result
      return sample
    })

    md['lead-summary-2010-obj'] = md['lead-samples-2010'].reduce(function (p, c) {
      if (!p[c.ulcs]) {
        p[c.ulcs] = {
          collected: 0,
          ulcs: c.ulcs,
          name: c.name,
          year: 2010
        }
        s.range().forEach(function (r) {
          p[c.ulcs][r] = 0
        })
      }
      p[c.ulcs].collected++
      p[c.ulcs][s(c.lead)]++
      return p
    }, {})

    md['lead-summary-2010'] = values(md['lead-summary-2010-obj'])

    md['lead-summary-2016-obj'] = md['lead-samples-2016'].reduce(function (p, c) {
      if (!p[c.ulcs]) {
        p[c.ulcs] = {
          collected: 0,
          ulcs: c['ULCS'],
          year: 2016,
          name: c.name
        }
        s.range().forEach(function (r) {
          p[c.ulcs][r] = 0
        })
      }
      p[c.ulcs].collected++
      p[c.ulcs][s(c.lead)]++
      return p
    }, {})
    // Add summary data
    md['lead-summary-2016'] = values(md['lead-summary-2016-obj'])
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
    metadata.byUlcs = metadata['school-conditions'].reduce(function (p, c) {
                                                      p[c['ULCS Code']] = c
                                                      p[c['ULCS Code']].lead = {}
                                                      return p
                                                    }, {})

    // Add 2016 lead data to each of these schools
    metadata['lead-samples-2016'].forEach(function (sample) {
      if (metadata.byUlcs[sample.ulcs].lead[2016]) {
        metadata.byUlcs[sample.ulcs].lead[2016].push(sample)
      } else {
        metadata.byUlcs[sample.ulcs].lead[2016] = [sample]
      }
    })

    // Add 2010 lead data to each of these schools
    metadata['lead-samples-2010'].forEach(function (sample) {
      if (metadata.byUlcs[sample.ulcs].lead[2010]) {
        metadata.byUlcs[sample.ulcs].lead[2010].push(sample)
      } else {
        metadata.byUlcs[sample.ulcs].lead[2010] = [sample]
      }
    })

    // Add reports, data pdfs, and images to the schools
    metadata['school-conditions'].forEach(function (school) {
      // Images
      if (fs.existsSync(__dirname + '/src/data/image/' + school['ULCS Code'])) {
        school.images = fs.readdirSync(__dirname + '/src/data/image/' + school['ULCS Code'])
      }

      // profile
      if (fs.existsSync(__dirname + '/src/data/pdf/profile/' + school['ULCS Code'] + '.pdf')) {
        school.profilePdf = school['ULCS Code'] + '.pdf'
      }

      // profile
      if (fs.existsSync(__dirname + '/src/data/pdf/report/' + school['ULCS Code'])) {
        school.reports = fs.readdirSync(__dirname + '/src/data/pdf/report/' + school['ULCS Code'])
      }

      // Lead
      if (fs.existsSync(__dirname + '/src/data/lead/' + school['ULCS Code'])) {
        school.leadReports = fs.readdirSync(__dirname + '/src/data/lead/' + school['ULCS Code'])
      }

    })

    next()
  })
  .use(function (files, metalsmith, next) {
    // Generate lead summary for a school (Used on school conditions page)
    var metadata = metalsmith.metadata()

    Object.keys(metadata.byUlcs).forEach(function (ulcs) {
      var school = metadata.byUlcs[ulcs]
      if (school.lead[2016]) {
        school.lead2016Summary = metadata['lead-summary-2016-obj'][school['ULCS Code']]
        school.lead2016Average = d3.format('.2f')(school.lead[2016].map(function (s) {
                                                         return s.lead
                                                       })
                                                       .reduce(function (p, c) {
                                                         if (ulcs == 8300) {
                                                          console.log(p, c)
                                                         }
                                                         return p + parseInt(c, 10)
                                                       }, 0) / school.lead[2016].length)

      }
      if (school.lead[2010]) {
        school.lead2010Summary = metadata['lead-summary-2010-obj'][school['ULCS Code']]
        school.lead2010Average = d3.format('.2f')(school.lead[2010].map(function (s) {
                                                         return s.lead
                                                       })
                                                       .reduce(function (p, c) {
                                                         return p + parseInt(c, 10)
                                                       }, 0) / school.lead[2010].length)
      }
    })
    next()
  })
  .use(function (files, metalsmith, next) {
    var byUlcs = metalsmith.metadata().byUlcs

    // Generate a facility page for each school
    Object.keys(byUlcs).forEach(function (ulcs) {
      var school = byUlcs[ulcs]
      school.slug = slug(school['School Name (ULCS)']).toLowerCase()
      files[school.slug + '.html'] = {
        contents: '',
        layout: 'facility-conditions.liquid',
        school: school,
        name: school['School Name (ULCS)'],
        ulcs: ulcs
      }

      // Give it a lead page, too
      files[school.slug + '/lead.html'] = {
        contents: '',
        layout: 'lead-detail.liquid',
        school: school,
        ulcs: ulcs,
        name: school['School Name (ULCS)']
      }
    })
    next()
  })
  .use(function (files, metalsmith, next) {
    // Generate an array of all schools and information we need to generate the search/map
    var metadata = metalsmith.metadata()

    metadata.allSchools = metadata['school-conditions'].map(function (school) {
      return {
        'School Name (ULCS)': school['School Name (ULCS)'],
        'ULCS Code': school['ULCS Code'],
        'Facility Condition Index [FCI]': school['Facility Condition Index [FCI]'],
        'Total # of Students': school['Total # of Students'],
        'Coordinates': school['Coordinates'],
        'Zip Code': school['Zip Code'],
        'School Type': school['School Type'],
        slug: school.slug,
        lead2016: school.lead[2016]
      }
    })

    metadata.schoolTypes = metadata.allSchools.map(function (s) {
                                                return s['School Type']
                                              })
                                              .filter(function (type, i, all) {
                                                return all.indexOf(type) === i
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
    includeDir: 'templates/includes',
    filters: {
      percentage: function (v) { return d3.format('%')(v) },
      currency: function (v) { return d3.format('$,')(v) }
    }
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
