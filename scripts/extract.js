var es = require('event-stream')
  , geo = require('../data/philly.geo.json')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')
  , fs = require('fs')

fs.createReadStream(__dirname + '/../data/master.csv')
  .pipe(csv({objectMode: true, columns: false}))
  .pipe(es.map(function (d, next) {
    if (d[0].indexOf('School Name') !== -1) {
      d.splice(13, 0, 'Replacement Cost [CRV]')
      return next(null, d)
    }

    fs.readFile(__dirname + '/../data/text/profile/' + d[6] + '.txt', function (err, data) {
      if (err) {
        // d.push.apply(d, ['', '', ''])
        return next(null, d)
      }

      var f = data.toString().split('\n')
        , rc = f[f.findIndex(function (line) {
                        return line.indexOf('Replacement Cost:') !== -1
                      })].substring(19)
        , cac = f[f.findIndex(function (line) {
                        return line.indexOf('Condition Assessment Cost:') !== -1
                      })].substring(28)

      // console.log(rc)
      d[12] = cac.replace(/,/g, '')
      d.splice(13, 0, rc.replace(/,/g, ''))
        // Condition Assessment Cost: $42,949,319
        // Replacement Cost: $95,850,000
      // d.push(building)
      // d.push(site)
      // d.push(footprint)

      next(null, d)
    })
  }))
  .pipe(stringify({eof: false}))
  .pipe(process.stdout)

