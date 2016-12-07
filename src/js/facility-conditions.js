var L = require('leaflet')
  , d3 = require('d3')
  , Chartist = require('chartist')
  , dp = require('dialog-polyfill')
  , $ = require('jquery')

window.Chartist = Chartist

// Just because of this stupid plugin
window.jQuery = $
require('./vendor/immybox')

require('chartist-plugin-legend')

module.exports = function () {
  var map = L.map('map', {
                zoomControl: true,
                closePopupOnClick: false,
                center: [39.9629, -75.1185],
                zoom: 10
              })
    , dots = []
    , selectedMarker = null

  map.zoomControl.setPosition('topright')

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
        Chartist.plugins.legend({clickable: false, position: document.querySelector('.demo-container .legend-container')})
      ]
    })
  }

  var loadSchool = function (data) {
    if (selectedMarker) {
      map.removeLayer(selectedMarker)
    }

    selectedMarker = L.marker(data.Coordinates.split(',').map(Number).reverse())
                      .addTo(map)
                      .bindPopup('<b>' + data['School Name (ULCS)'] + '</b> (' + data['ULCS Code'] + ')').openPopup()

    document.querySelector('.left').classList.add('school-selected')
    document.querySelector('.instructions').classList.add('hide')

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
    var min = document.querySelector('#min-fci').value / 100
      , max = document.querySelector('#max-fci').value / 100
      , leadOnly = document.querySelector('#lead-only').checked

    if (max === 1) {
      max = Infinity
    }

    console.log('leadOnly', leadOnly)

    dots.forEach(function (dot, i) {
      var fci = dot.options._data['Facility Condition Index [FCI]']
        , hidden = fci < min || fci >= max //|| fci == 'UNKNOWN'

      if (!hidden && leadOnly) {
        hidden = !data.leadByUlcs[dot.options._data['ULCS Code']]
      }


      if (hidden) {
        dot._path.classList.add('hide')
      } else {
        dot._path.classList.remove('hide')
      }

      return
    })
  }

  // Draw Philly
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }).addTo(map)

  var size = d3.scale.linear()
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
                .bindPopup('<b>' + d['School Name (ULCS)'] + '</b> (' + d['ULCS Code'] + ')')
                .on('mouseover', function (e) {
                  this.openPopup()
                })
                .on('mouseout', function (e) {
                  this.closePopup()
                })
                .on('click', function () {
                  loadSchool(this.options._data)
                })
                .addTo(map)

    dots.push(dot)
  })

  function onSlide (bound) {
    var value = document.querySelector('#' + bound + '-fci').value
    document.querySelector('#' + bound + '-fci-output').innerHTML = value + '%'
  }

  d3.select('.clear')
    .on('click', function () {
      d3.select('.left').classed('school-selected', false)
      d3.select('.instructions').classed('hide', false)
      d3.select('#search').node().value = ''

      if (selectedMarker) {
        map.removeLayer(selectedMarker)
        delete selectedMarker
      }
    })

  var dialog = document.querySelector('dialog')

  if (!dialog.showModal) {
    dp.registerDialog(dialog)
  }

  d3.select('#filter-options')
    .on('click', function () {
      onSlide('min')
      onSlide('max')
      dialog.showModal()
    })

  d3.select('dialog .close')
    .on('click', function () {
      d3.select('#map').classed('lead-only', document.querySelector('#lead-only').checked)
      filterSchools()
      dialog.close()
    })

  d3.select('dialog .clear')
    .on('click', function () {
      document.querySelector('#min-fci').MaterialSlider.change(0)
      document.querySelector('#max-fci').MaterialSlider.change(100)
      if (document.querySelector('#lead-only').checked) {
        document.querySelector('#lead-only').click()
      }
      d3.select('#map').classed('lead-only', false)
      filterSchools()
      dialog.close()
    })

  // Only use jquery because of immybox
  $('#search').immybox({
    choices: window.data.schools.map(function (school) {
      return {
        text: school['School Name (ULCS)'],
        value: school['ULCS Code'],
        zipcode: school['Zip Code']
      }
    }),
    filterFn: function (query) {
      var query = query.toLowerCase()
      return function (choice) {
        return choice.text.toLowerCase().indexOf(query) >= 0 ||
               choice.value.indexOf(query) >= 0 ||
               choice.zipcode.indexOf(query) >= 0
      }
    },
    openOnClick: false
  })

  $('#search').on('update', function (e, ulcs) {
    // Event fired by immmybox
    if (!ulcs) {
      return
    }
    loadSchool(window.data.schools.filter(function (s) {
      return s['ULCS Code'] == ulcs
    })[0])
  })

  // Handle the slider label updates
  document.querySelector('#min-fci')
          .addEventListener('input', onSlide.bind(null, 'min'))
  document.querySelector('#max-fci')
          .addEventListener('input', onSlide.bind(null, 'max'))
}
