function loadSchools (next) {
  var url = 'https://spreadsheets.google.com/feeds/list/13lKZiT0nbnswab36cBlV37_Wb6ppikbHwzcx14Rvkog/1/public/values?alt=json'
  d3.json(url, function (err, response) {
    if (err) {
      return next(err)
    }

    var schools = response.feed.entry.map(function (entry) {
      return Object.keys(entry).reduce(function (p, c) {
        if (c.indexOf('gsx$') === 0) {
          p[c.slice(4)] = entry[c].$t
        }
        return p
      }, {})
    })

    // Lead data is in page 2
    d3.json('https://spreadsheets.google.com/feeds/list/13lKZiT0nbnswab36cBlV37_Wb6ppikbHwzcx14Rvkog/2/public/values?alt=json', function (err, response) {
      var lead = response.feed.entry.map(function (entry) {
        return Object.keys(entry).reduce(function (p, c) {
          if (c.indexOf('gsx$') === 0) {
            p[c.slice(4)] = entry[c].$t
          }
          return p
        }, {})
      })
      lead.forEach(function (d) {
        var s = schools.filter(function (s) { return s.ulcscode == d.ulcs })[0]
        if (s) {
          s.lead = s.lead || []
          s.lead.push(d) // Can have multiple sample dates
        }
      })
      next(null, schools)
    })
  })
}
