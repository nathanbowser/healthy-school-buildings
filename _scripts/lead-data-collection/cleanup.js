var fs = require('fs')
  , map = require('./ulcs-name-map.json')
  , mkdirp = require('mkdirp')

// Copy results data into the correct directory
fs.readdirSync(__dirname + '/results/originals')
  .forEach(function (result) {
    var ulcs
    if (/^\d{4,4}-/.test(result)) {
      ulcs = result.substr(0, 4)

      if (!fs.existsSync(__dirname + '/schools/' + ulcs + '/results')) {
        mkdirp.sync(__dirname + '/schools/' + ulcs + '/results')
      }

      fs.createReadStream(__dirname + '/results/originals/' + result)
        .pipe(fs.createWriteStream(__dirname + '/schools/' + ulcs + '/results/' + result))
    } else {
      console.log('ALERT: Manually move ' + result)
    }
  })

// Now do the same thing for the reports
fs.readdirSync(__dirname + '/reports/originals')
  .forEach(function (result) {
    var ulcs
    if (/^\d{4,4}-/.test(result)) {
      ulcs = result.substr(0, 4)

      if (!fs.existsSync(__dirname + '/schools/' + ulcs + '/reports')) {
        mkdirp.sync(__dirname + '/schools/' + ulcs + '/reports')
      }

      fs.createReadStream(__dirname + '/reports/originals/' + result)
        .pipe(fs.createWriteStream(__dirname + '/schools/' + ulcs + '/reports/' + result))
    } else {
      var name = result.toLowerCase().split('-letter.pdf')[0]

      var matches = Object.keys(map).filter(function (key) {
                                      return key.toLowerCase().search(name) !== -1
                                    })
      if (matches.length === 0 || matches.length > 1) {
        console.log('Unable to find a matching school for report [', result, ']. MOVE MANUALLY')
      } else {
        var ulcs = map[matches[0]]
        console.log('Moving [' + result + ']' + ' to ' + matches[0] + ' -- ' + ulcs)

        if (!fs.existsSync(__dirname + '/schools/' + ulcs + '/reports')) {
          mkdirp.sync(__dirname + '/schools/' + ulcs + '/reports')
        }

        fs.createReadStream(__dirname + '/reports/originals/' + result)
          .pipe(fs.createWriteStream(__dirname + '/schools/' + ulcs + '/reports/' + result))
      }
    }
  })
