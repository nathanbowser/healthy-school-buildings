var fs = require('fs')
  , map = require('../lead-data-collection/ulcs-name-map.json')
  , mkdirp = require('mkdirp')
  , Sifter = require('sifter')
  , schools = Object.keys(map).map(function (name) {
                      return {
                        name: name,
                        ulcs: map[name]
                      }
                    })

var sifter = new Sifter(schools)

fs.readdirSync(__dirname + '/originals')
  .forEach(function (filename) {
    var name = filename.slice(0, -4).replace(/\-/g, ' ')
      , result = sifter.search(name, {
                         fields: ['name']
                       })

    if (result.items.length === 1) {
      // console.log(filename, 'to', schools[result.items[0].id])

      var ulcs = map[schools[result.items[0].id].name]
      fs.createReadStream(__dirname + '/originals/' + filename)
        .pipe(fs.createWriteStream(__dirname + '/pdfs/' + ulcs + '.pdf'))
    } else {
      fs.createReadStream(__dirname + '/originals/' + filename)
        .pipe(fs.createWriteStream(__dirname + '/pdfs/' + filename))
      // console.log('Could not find a school in our system that matches the pdf:', filename)
    }

  })
