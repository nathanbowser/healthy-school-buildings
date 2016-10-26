var fs = require('fs')
  , path = require('path')
  , base = path.join(__dirname)

fs.readdir(base, function (err, schools) {
  schools.forEach(function (s) {
    if (err) {
      throw err
    }
    var _s = s.substring(0, 4)
    if (/^[0-9]{4}$/.test(_s)) {
     fs.readdir(base + '/' + _s, function (err, pdfs) {
      console.log(pdfs)
      fs.writeFileSync(path.join(base, _s, 'pdfs.json'), JSON.stringify({
        letter: 'letter.pdf',
        results: pdfs.filter(function (p) { return p.indexOf('letter') == -1 })
      }))
     })
    }
    // school.filter(function (s) {
    //         return parseInt(s, 10) > 0
    //       })
    //       .forEach(function (s) {
    //         var d = path.join(base, s)
    //         fs.readdir(d, function (err, images) {
    //           if (err) {
    //             throw err
    //           }
    //           fs.writeFileSync(path.join(d, 'images.json'), JSON.stringify(images.filter(function (i) {
    //             return i !== 'images.json'
    //           })))
    //         })
    //       })
  })
})
