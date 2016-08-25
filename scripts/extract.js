var es = require('event-stream')
  , geo = require('../data/philly.geo.json')
  , csv = require('csv-streamify')
  , stringify = require('csv-stringify')
  , fs = require('fs')

fs.createReadStream(__dirname + '/../data/master.csv')
  .pipe(csv({objectMode: true, columns: false}))
  .pipe(es.map(function (d, next) {
    if (d[0].indexOf('School Name') !== -1) {
      d.splice(11, 0, 'Planning Area')
      d.splice(12, 0, 'Police District')
      d.splice(35, 0, 'Capacity')
      d.splice(36, 0, '# Floors')
      d.push('Avg Daily Attendance')
      d.push('10+ Absences')
      return next(null, d)
    }

    fs.readFile(__dirname + '/../data/text/profile/' + d[6] + '.txt', function (err, data) {
      if (err) {
        d.splice(11, 0, '')
        d.splice(12, 0, '')
        d.splice(35, 0, '')
        d.splice(36, 0, '')
        d.push('')
        d.push('')
        return next(null, d)
      }

      var f = data.toString().split('\n')
        , pa = f[f.findIndex(function (line) {
                        return line.indexOf('Planning Area') !== -1
                      })].substring(14)
        , pd = f[f.findIndex(function (line) {
                        return line.indexOf('Police District') !== -1
                      })].substring(16)
        , capacity = f[f.findIndex(function (line) {
                        return line.indexOf('Capacity:') !== -1
                      })].substring(10).replace(/,/g, '')
        , noFloors = f[f.findIndex(function (line) {
                        return line.indexOf('No. of Floors') !== -1
                      })].substring(15)
        , avgDaily = f[f.findIndex(function (line) {
                        return line.indexOf('Daily Attendance:') !== -1
                      })]
        , avgDailyT = avgDaily && avgDaily.substring(22)
        , tenPlus = f[f.findIndex(function (line) {
                        return line.indexOf('10+ Absences:') !== -1
                      })]
        , tenPlusT = tenPlus && tenPlus.substring(14)

      d.splice(11, 0, pa || '')
      d.splice(12, 0, pd || '')
      d.splice(35, 0, capacity)
      d.splice(36, 0, noFloors)
      d.push(avgDailyT)
      d.push(tenPlusT)

      next(null, d)
    })
  }))
  .pipe(stringify({eof: false}))
  .pipe(process.stdout)

