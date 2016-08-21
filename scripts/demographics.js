var es = require('event-stream')
  , fs = require('fs')
  , reduce = require('stream-reduce')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')
  , rows = 0

var lookup = {
  'American Indian/Alaskan Native (Not Hispanic)': 4,
  'Asian (not Hispanic)': 6,
  'Black/African American (not Hispanic)': 8,
  'Hispanic (any race)': 10,
  'Multi-Race/Two or more races (not Hispanic)': 12,
  'Native Hawaiian or other Pacific Islander (not Hispanic)': 14,
  'White (not Hispanic)': 16
}

function append (all) {
  fs.createReadStream(__dirname + '/data.csv')
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(es.map(function (d, next) {
      var ulcs = d[6]

      if (d[0].indexOf('School Name') !== -1) {
        d.push.apply(d, Object.keys(lookup).reduce(function (p, c) {
          p.push(c + ' - Count')
          p.push(c + ' - Percentage')
          return p
        }, []))
        return next(null, d)
      }

      var demographics = all[ulcs]
      d[10] = demographics.total

      d.push.apply(d, Object.keys(demographics.demographics).map(function (key) {
        return demographics.demographics[key]
      }))
      next(null, d)
    }))
    .pipe(stringify({eof: false}))
    .pipe(process.stdout)

}

function add (next) {
  fs.createReadStream(__dirname + '/demographics.csv')
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(es.map(function (row, next) {
      if (rows++ == 0) {
        return next()
      }
      if (row[2] !== 'ALL GRADES') {
        return next()
      }
      return next(null, row)
    }))
    .pipe(es.map(function (row, next) {
      var result = {
        ulcs: row[0] + 0,
        total: row[3],
        demographics: {}
      }
      Object.keys(lookup).forEach(function (race) {
        var value = row[lookup[race]]
        result.demographics[race + ' - Count'] = value !== 's' ? value : ''
        result.demographics[race + ' - Percentage'] = value !== 's' ? row[lookup[race] + 1] : ''
      })
      next(null, result)
    }))
    .pipe(reduce(function (result, data) {
      result[data.ulcs] = data
      return result
    }, {}))
    .on('data', next)
}

add(append)
