var L = require('leaflet')
  , d3 = require('d3')
  , Sifter = require('sifter')
  , Chartist = require('chartist')

window.Chartist = Chartist

require('chartist-plugin-legend')

module.exports = function () {
  var map = L.map('map', { zoomControl: true }).setView([39.9629, -75.1185], 11)
    , dots = []

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

    new Chartist.Pie('.ct-chart', {
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
          position: 'top'
        })
      ],
      chartPadding: {
        top: 0,
        bottom: 50,
        left: 100
      }
    })
  }

  var loadSchool = function (dot) {
    document.querySelector('.school-profile').classList.remove('hide')
    document.querySelector('.school-profile-default').classList.add('hide')

    var data = this.options._data

    document.querySelector('.school-name').innerHTML = data['School Name (ULCS)']
    document.querySelector('.ulcs').innerHTML = data['ULCS Code']
    document.querySelector('.region').innerHTML = data['Planning Area']
    document.querySelector('.address').innerHTML = data['Street Address']
    document.querySelector('.level').innerHTML = data['School Type']
    document.querySelector('.councilmanic').innerHTML = data['Councilmanic District & Rep']
    document.querySelector('.managed').innerHTML = data['Managed']
    document.querySelector('.principal').innerHTML = data['Principal']
    document.querySelector('.year').innerHTML = data['Year Built']
    document.querySelector('.size').innerHTML = data['Sq. Ft. (Building)']
    document.querySelector('.student-count').innerHTML = data['Total # of Students']
    document.querySelector('.fci').innerHTML = d3.format('%')(data['Facility Condition Index [FCI]'])
    document.querySelector('.econ').innerHTML = data['CEP Economically Disadvantaged Rate']
    document.querySelector('.special-needs').innerHTML = data['Special Needs - Percentage']
    document.querySelector('.crv').innerHTML = d3.format('$,')(data['Replacement Cost [CRV]'])
    document.querySelector('.cac').innerHTML = d3.format('$,')(data['Condition Assessment Cost [CAC]'])

    demographics(data)

    var lead = window.data.leadByUlcs[data['ULCS Code']]
      , lc = document.querySelector('.lead-container')

    if (lead) {
      lc.querySelector('a').href = '../lead/' + data['ULCS Code']
      lc.querySelector('.lead-data').classList.remove('hide')
      lc.querySelector('.no-lead').classList.add('hide')

      var total = lead.reduce(function (p, c) {
        p.Above = parseInt(p.Above, 10) + parseInt(c.Above, 10)
        p['Total # of Samples Collected'] = parseInt(p['Total # of Samples Collected'], 10) +  parseInt(c['Total # of Samples Collected'], 10)
        return p
      })

      if (total.Above) {
        lc.querySelector('.lead-summary').innerHTML = 'There ' + (total.Above > 1 ? 'were ' : 'was ') +  total.Above + ' drinking water outlet(s) out of ' + total['Total # of Samples Collected'] +
                                                     ' samples that was found to be above the 15 ppb AL.'
      } else {
        lc.querySelector('.lead-summary').innerHTML = 'Of the ' + total['Total # of Samples Collected'] + ' drinking water outlets sampled none showed lead about the 15 ppb AL.'

      }

      var ul = lc.querySelector('.lead-data ul')
      ul.innerHTML = ''
      lead.forEach(function (l) {
        ul.innerHTML += ('<li>' + l['Above']
                                       + '[' + (l['Above'] / l['Total # of Samples Collected']) + ']'
                                       + ' - samples collected on ' + l['Date Sampled'] + '</li>')
      })
    } else {
      lc.querySelector('.lead-data').classList.add('hide')
      lc.querySelector('.no-lead').classList.remove('hide')
    }
  }

  function filterSchools () {
    if (!sifter) {
      return
    }

    var min = document.querySelector('#min-fci').value / 100
      , max = document.querySelector('#max-fci').value / 100
      , leadOnly = document.querySelector('#lead-only').checked
      , term = document.querySelector('#search').value.trim()
      , sifted = sifter.search(term, {
                         fields: ['schoolnameulcs', '_schoolnameulcs', 'ulcscode', 'streetaddress', 'zipcode']
                       })
                       .items
                       .map(function (r) {
                         return r.id
                       })

    if (max === 1) {
      max = Infinity
    }

    dots.forEach(function (dot, i) {
      var fci = dot.options._data['Facility Condition Index [FCI]']
        , hidden = fci < min || fci >= max //|| fci == 'UNKNOWN'

      if (!hidden && leadOnly) {
        hidden = !data.leadByUlcs[dot.options._data['ULCS Code']]
      }

      if (!hidden) {
        hidden = sifted.indexOf(i) === -1
      }

      if (hidden) {
        dot._path.classList.add('hide')
      } else {
        dot._path.classList.remove('hide')
      }

      return
    })

    // schools.style('display', '')
    //        .filter(function (d, i) {

    //        })
    //        .style('display', 'none')
  }

  // Draw Philly
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }).addTo(map)

  var sifter = new Sifter(window.data.schools.map(function (_school) {
                    _school._schoolnameulcs = _school['School Name (ULCS)'].replace(/\s/g, '')
                    return _school
                  }))
    , size = d3.scale.linear()
                     .domain(d3.extent(window.data.schools, function (d) {
                       return parseInt(d['Total # of Students'], 10)
                     }))
                     .range([300, 1000])
    , heatmap = d3.scale.threshold()
                        .domain([.15, .25, .45, .60])
                        .range([{
                          color: '#4f7a28',
                          text: 'Good'
                        }, {
                          color: '#f5ec00',
                          text: 'Fair'
                        }, {
                          color: '#ff8647',
                          text: 'Poor'
                        }, {
                          color: '#d95000',
                          text: 'Very Poor'
                        }, {
                          color: '#b51a00',
                          text: 'Critical'
                        }])

  window.data.schools.forEach(function (d) {
    var dot = L.circle(d.Coordinates.split(',').map(Number).reverse(), {
                  stroke: 0,
                  fillColor: heatmap(d['Facility Condition Index [FCI]']).color,
                  fillOpacity: .8,
                  radius: size(d['Total # of Students']),
                  _data: d
                })
                .bindPopup(d['School Name (ULCS)'])
                .on('mouseover', function (e) {
                  this.openPopup()
                })
                .on('mouseout', function (e) {
                  this.closePopup()
                })
                .on('click', loadSchool)
                .addTo(map)

    dots.push(dot)
  })


  function onSlide (bound) {
    var value = document.querySelector('#' + bound + '-fci').value
    document.querySelector('#' + bound + '-fci-output').innerHTML = value + '%'
    filterSchools()
  }

  onSlide('min')
  onSlide('max')
  // Handle the slider
  document.querySelector('#min-fci')
          .addEventListener('input', onSlide.bind(null, 'min'))
  document.querySelector('#max-fci')
          .addEventListener('input', onSlide.bind(null, 'max'))
  document.querySelector('#lead-only')
          .addEventListener('change', function () {
            d3.select('#map').classed('lead-only', this.checked)
            filterSchools()
          })
  document.querySelector('#search')
          .addEventListener('keyup', filterSchools)

  document.querySelector('.mdl-menu')
          .addEventListener('click', function (e) {
            e.stopPropagation()
          })
}
