var d3 = require('d3')
  , L = require('leaflet')
  , dp = require('dialog-polyfill')
  , $ = require('jquery')

var loadSchool = function (data) {
  window.location.href = window.data.school ? ('../' + data.slug) : data.slug
}

// Just because of this stupid plugin
window.jQuery = $
require('./vendor/immybox')

// Set up the map and input search
module.exports = function () {
  var map = L.map('map', {
                zoomControl: true,
                closePopupOnClick: false,
                center: [39.9629, -75.1185],
                zoom: 10
              })
    , dots = []

  map.zoomControl.setPosition('topright')

  // Draw Philly
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }).addTo(map)

  var school = window.data.school
  if (school) {
    // We're showing a school. Pin it
    L.marker(school.Coordinates.split(',').map(Number).reverse())
     .addTo(map)
     .bindPopup('<b>' + school['School Name (ULCS)'] + '</b> (' + school['ULCS Code'] + ')').openPopup()
  }

  var size = d3.scale.linear()
                     .domain(d3.extent(window.data.all, function (d) {
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

  window.data.all.forEach(function (d) {
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
    choices: window.data.all.map(function (school) {
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
    loadSchool(window.data.all.filter(function (s) {
      return s['ULCS Code'] == ulcs
    })[0])
  })

  // Handle the slider label updates
  document.querySelector('#min-fci')
          .addEventListener('input', onSlide.bind(null, 'min'))
  document.querySelector('#max-fci')
          .addEventListener('input', onSlide.bind(null, 'max'))

  function filterSchools () {
    var min = document.querySelector('#min-fci').value / 100
      , max = document.querySelector('#max-fci').value / 100
      , leadOnly = document.querySelector('#lead-only').checked

    if (max === 1) {
      max = Infinity
    }

    dots.forEach(function (dot, i) {
      var fci = dot.options._data['Facility Condition Index [FCI]']
        , hidden = fci < min || fci >= max //|| fci == 'UNKNOWN'

      if (!hidden && leadOnly) {
        hidden = !dot.options._data.lead2016
      }

      if (hidden) {
        dot._path.classList.add('hide')
      } else {
        dot._path.classList.remove('hide')
      }

      return
    })
  }
}
