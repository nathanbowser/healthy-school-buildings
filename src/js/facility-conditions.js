var Chartist = require('chartist')
  , map = require('./map-search')

window.Chartist = Chartist
require('chartist-plugin-legend')

function demographics (data) {
  var offset = 0

  var _data = [
    ['White', data['White (not Hispanic) - Count'], data['White (not Hispanic) - Percentage']],
    ['Native Hawaiian or Other Pacific', data['Native Hawaiian or other Pacific Islander (not Hispanic) - Count'], data['Native Hawaiian or other Pacific Islander (not Hispanic) - Percentage']],
    ['Multi Race/Other', data['Multi-Race/Two or more races (not Hispanic) - Count'], data['Multi-Race/Two or more races (not Hispanic) - Percentage']],
    ['Hispanic', data['Hispanic (any race) - Count'], data['Hispanic (any race) - Percentage']],
    ['African American', data['Black/African American (not Hispanic) - Count'], data['Black/African American (not Hispanic) - Percentage']],
    ['Asian', data['Asian (not Hispanic) - Count'], data['Asian (not Hispanic) - Percentage']],
    ['American Indian/Alaskan', data['American Indian/Alaskan Native (Not Hispanic) - Count'], data['American Indian/Alaskan Native (Not Hispanic) - Percentage']]
  ].filter(function (d) {
    return d[1]
  })

  document.querySelector('.demo-container .legend-container').innerHTML = ''

  var pie = new Chartist.Pie('.ct-chart', {
    series: _data.map(function (d) {
                    return d[1]
                  }),
    labels: _data.map(function (d) {
                    return d[0] + '(' + d[2] + ')'
                  })
  }, {
    showLabel: false,
    plugins: [
      Chartist.plugins.legend({
        clickable: false,
        position: document.querySelector('.demo-container .legend-container')
      })
    ]
  })
}

module.exports = function () {
  map()

  var school = window.data.school

  if (school) {
    // Draw demographics for this school
    demographics(window.data.school)
  }
}
