var fs = require('fs')
  , path = require('path')
  , base = path.join(__dirname)
  , schools = require('./schools.json')
  , es = require('event-stream')

console.log('ULCS, School Name, Outlet ID #,Outlet Location,Sample Collection Date,Test Result (ppb),Test Results')
fs.createReadStream('./all.txt')
  .pipe(es.split())
  .pipe(es.mapSync(function (sample) {
    var ulcs = sample.substring(0, 4)

    if (ulcs === '5341') {
      ulcs = '5340'
    }
    var name = schools[ulcs]

    if (!name) {
      console.log(ulcs)
    }
    return ulcs + ',' + name + ',' + sample + '\n'
  }))
  .pipe(process.stdout)
  // .pipe(es.stringify())
  // .pipe(fs.createWriteStream('./dunno.csv'))


  // schools.forEach(function (s) {
  //   var _s = s.substring(0, 4)
  //   if (/^[0-9]{4}$/.test(_s)) {
  //     fs.readdir(path.join(base, _s), function (err, files) {
  //       files.forEach(function (f) {
  //         if (f.indexOf(_s) !== -1) {
  //           console.log(f)
  //           fs.createReadStream(path.join(base, _s, f))
  //             .pipe(fs.createWriteStream(path.join(__dirname, 'all-pdfs', f)))
  //         }
  //       })
  //     })
  //   }



    // if (err) {
    //   throw err
    // }
    // var _s = s.substring(0, 4)
    // if (/^[0-9]{4}$/.test(_s)) {
    //  fs.readdir(base + '/' + _s, function (err, pdfs) {
    //   console.log(pdfs)
    //   fs.writeFileSync(path.join(base, _s, 'pdfs.json'), JSON.stringify({
    //     letter: 'letter.pdf',
    //     results: pdfs.filter(function (p) { return p.indexOf('letter') == -1 })
    //   }))
    //  })
    // }
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
//   })
// })
