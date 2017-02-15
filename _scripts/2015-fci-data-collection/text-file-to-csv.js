var fs = require('fs')
  , parse = require('csv-parse')
  , csvrow = require('csvrow')
  , stringify = require('csv-stringify')
  , schools = []

fs.readdirSync('./pdfs-as-text/')
  .forEach(function (f) {
    var txt = fs.readFileSync('./pdfs-as-text/' + f, 'utf8')
      , data = txt.split('\n')
      , school = {
        ulcs: data[0]
      }
    data.filter(function (row, i) {
          return i > 1 && i < 5
        })
        .forEach(function (row) {
          var _row = csvrow.parse(row.slice(0, -1))
          ;['FCI', 'Repair Costs', 'Replacement Costs'].forEach(function (type, idx) {
            school[type + ' - ' + _row[0]] = _row[idx + 1]
          })
        })

    data.filter(function (row, i) {
          return i > 5 && i < 20
        })
        .forEach(function (row) {
          var _row = csvrow.parse(row.slice(0, -1))
          ;['System FCI','Repair Costs','Replacement Cost'].forEach(function (type, idx) {
            school[type + ' - ' + _row[0]] = _row[idx + 1]
          })
        })

    schools.push(school)
  })

var headers = Object.keys(schools[0])
  , result = [Object.keys(schools[0])]

schools.forEach(function (s) {
  result.push(headers.map(function (h) {
    return s[h]
  }))
})


stringify(result, function (err, output) {
  console.log(output)
})
