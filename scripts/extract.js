var es = require('event-stream')
  , geo = require('../data/philly.geo.json')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')
  , fs = require('fs')

fs.createReadStream(__dirname + '/../data/master.csv')
  .pipe(csv({objectMode: true, columns: false}))
  .pipe(es.map(function (d, next) {
    if (d[0].indexOf('School Name') !== -1) {
      d.push('Sq. Ft. (Building)')
      d.push('Sq. Ft. (Site)')
      d.push('Sq. Ft. (Footprint)')
      return next(null, d)
    }

    fs.readFile(__dirname + '/../data/text/profile/' + d[6] + '.txt', function (err, data) {
      // console.log(data)
      if (err) {
        // console.log('oh no', err)
        d.push.apply(d, ['', '', ''])
        return next(null, d)
      }

      var f = data.toString().split('\n')
        , building = f[f.findIndex(function (line) {
                        return line.indexOf('S.F. (Building):') !== -1
                      })].substring(17)
        , site = f[f.findIndex(function (line) {
                    return line.indexOf('S.F. (Site):') !== -1
                  })].substring(13).split(' ')[0]
        , footprint = f[f.findIndex(function (line) {
                        return line.indexOf('S.F. (Footprint):') !== -1
                      })].substring(18)
      d.push(building)
      d.push(site)
      d.push(footprint)

      next(null, d)
    })
  }))
  .pipe(stringify({eof: false}))
  .pipe(process.stdout)

