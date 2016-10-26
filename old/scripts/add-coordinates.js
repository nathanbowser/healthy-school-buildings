var es = require('event-stream')
  , fs = require('fs')
  , geo = require('../data/philly.geo.json')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')

fs.createReadStream(__dirname + '/../data/SchoolDeficiencyMapData.csv')
  .pipe(csv({objectMode: true, columns: false}))
  .pipe(es.mapSync(function (d) {
    var school = geo.features.filter(function (s) {
      return s.properties.facil_id == d[5]
    })[0]
    if (!school) {
      console.error('Cannot find data for:', d[1], d[5])
    }
    d.splice(4, 0, school && school.geometry.coordinates.join(',') || '')
    return d
  }))
  .pipe(stringify({eof: false}))
  .pipe(process.stdout)
