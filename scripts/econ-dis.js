var es = require('event-stream')
  , fs = require('fs')
  , reduce = require('stream-reduce')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')

function append (all) {
  fs.createReadStream(__dirname + '/../data.csv')
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(es.map(function (d, next) {
      var ulcs = d[6]

      if (d[0].indexOf('School Name') !== -1) {
        d.push('Special Needs - Count')
        d.push('Special Needs - Percentage')
        return next(null, d)
      }

      var rate = all[ulcs]
      d.push(rate[4])
      d.push(rate[5])
      next(null, d)
    }))
    .pipe(stringify({eof: false}))
    .pipe(process.stdout)
}

function add (next) {
  fs.createReadStream(__dirname + '/../data/special.csv')
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(es.map(function (d, next) {
      if (d[2] === 'ALL GRADES') {
        return next(null, d)
      }
      next()
    }))
    .pipe(reduce(function (result, data) {
      data[0] += 0
      result[data[0]] = data
      return result
    }, {}))
    .on('data', next)
}

add(append)
