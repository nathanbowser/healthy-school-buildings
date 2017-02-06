var es = require('event-stream')
  , fs = require('fs')
  , stringify = require('csv-stringify')
  , csv = require('csv-streamify')
  , newData = require('./2015-fci-data-collection/2015-data')
  , mapped = require('./2015-fci-data-collection/2015-data')
                .reduce(function (p, c) {
                  if (c.properties.BldgID1) {
                    p[c.properties.BldgID1.substr(1,4)] = {
                      fci: c.properties.BldgFCI1,
                      repair: c.properties.BldgFCI1Repair,
                      replace: c.properties.BldgFCI1Replace
                    }
                  }
                  if (c.properties.BldgID2 && !p[c.properties.BldgID2.substr(1,4)]) {
                    p[c.properties.BldgID2.substr(1,4)] = {
                      fci: c.properties.BldgFCI2,
                      repair: c.properties.BldgFCI2Repair,
                      replace: c.properties.BldgFC21Replace
                    }
                  }
                  if (c.properties.BldgID3 && !p[c.properties.BldgID3.substr(1,4)]) {
                    p[c.properties.BldgID3.substr(1,4)] = {
                      fci: c.properties.BldgFCI3,
                      repair: c.properties.BldgFCI3Repair,
                      replace: c.properties.BldgFCI3Replace
                    }
                  }
                  // if (c.properties.PrgmID1) {
                  //   p[c.properties.PrgmID1] = c.properties
                  // } else if (c.properties.PrgmName2) {
                  //   p[c.properties.PrgmName2] = c.properties
                  // }
                  return p
                }, {})

  fs.createReadStream(__dirname + '/../src/data/school-conditions.csv')
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(es.map(function (d, next) {
      var ulcs = d[6]
        , school = mapped[ulcs]

      if (ulcs == 'ULCS Code') {
        // header row
        d.splice(18, 0, '2015 Facility Condition Index [FCI]')
        d.splice(19, 0, '2015 Condition Assessment Cost [CAC]')
        d.splice(20, 0, '2015 Replacement Cost [CRV]')
        return next(null, d)
      }

      if (!school) {
        var filtered = newData.filter(function (d) {
          return d.properties.PrgmName2 == ulcs || d.properties.PrgmType1 == ulcs
        })
        if (filtered.length == 1) {
          school = {
            fci: filtered[0].properties.BldgFCI1,
            repair: filtered[0].properties.BldgFCI1Repair,
            replace: filtered[0].properties.BldgFCI1Replace
          }
        } else {
          // console.log('Unable to find', ulcs)
          school = {
            fci: '',
            repair: '',
            replace: ''
          }
        }
      }
      if (school.fci) {
        if (typeof school.fci === 'string') {
          school.fci = parseFloat(school.fci)
        }
        // Turn into percentage
        school.fci = (school.fci / 100).toFixed(3)
      }
      if (school.repair) {
        school.repair = school.repair.replace(/[^0-9-.]/g, '')
      }
      if (school.replace) {
        school.replace = school.replace.replace(/[^0-9-.]/g, '')
      }
      d.splice(18, 0, school.fci)
      d.splice(19, 0, school.repair)
      d.splice(20, 0, school.replace)
      return next(null, d)
    }))
    .pipe(stringify({eof: false}))
    .pipe(process.stdout)
