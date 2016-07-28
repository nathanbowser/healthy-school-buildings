var fs = require('fs')
  , path = require('path')
  , base = path.join(__dirname, '/../data/image')

fs.readdir(base, function (err, school) {
  if (err) {
    throw err
  }
  school.filter(function (s) {
          return parseInt(s, 10) > 0
        })
        .forEach(function (s) {
          var d = path.join(base, s)
          fs.readdir(d, function (err, images) {
            if (err) {
              throw err
            }
            fs.writeFileSync(path.join(d, 'images.json'), JSON.stringify(images))
          })
        })
})
