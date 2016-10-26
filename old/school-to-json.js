var es = require('event-stream')
  , fs = require('fs')
  , path = require('path')
  , profile = __dirname + '/data/text/profile'

fs.readdir(profile, function (err, files) {
  if (err) {
    throw err
  }
  files.forEach(function (filename) {
    fs.readFile(path.join(profile, filename), function (err, file) {
      var ar = file.toString().split('\n')

      var result = {
        name: ar[2],
        region: ar[1],
        address: ar[3],
        fci: ar[ar.findIndex(function (line) {
                return line.indexOf('Facilities Condition Index:') !== -1
              })].substr(28),
        status: ar[ar.findIndex(function (line) {
                return line.indexOf('Status:') !== -1
              })].substr(7),
        level: ar[ar.findIndex(function (line) {
                return line.indexOf('Level:') !== -1
              })].substr(6),
        demographics: []
      }

      var idx = ar.indexOf('Racial Breakdown') + 1
        , demo = ar[idx]

      while (demo.indexOf('%') !== -1) {
        var reg = demo.match(/^(.*?)(\d+) (\d+%)/)
        result.demographics.push({
          name: reg[1].trim(),
          count: reg[2],
          percentage: reg[3]
        })
        demo = ar[++idx]
      }

      // Add everything that is split by a colon
      for (var i = 0; i < ar.length; i++) {
        var s = ar[i].split(':') // NOT A COLON
        if (s.length > 1) {
          result[s[0]] = s[1].trim()
        }
      }
      fs.writeFile(path.join(__dirname, '/data/json/profile', path.basename(filename, '.txt')) + '.json', JSON.stringify(result), function (err) {
        // console.log(err)
      })
    })
  })
})
