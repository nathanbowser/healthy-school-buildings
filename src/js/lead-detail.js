var gauge = require('./liquid-fill-gauge')

module.exports = function () {
  var school = window.data.school
    , config = gauge.config()

  config.circleThickness = 0.2
  config.textVertPosition = 0.2
  config.waveAnimateTime = 2000

  var gauge2010 = gauge.load('gauge-2010', 100, config)
    , gauge2016 = gauge.load('gauge-2016', 100, config)

  document.querySelector('#min-ppb')
          .addEventListener('input', onSlide.bind(null, 'min'))
  document.querySelector('#max-ppb')
          .addEventListener('input', onSlide.bind(null, 'max'))

  onSlide('min')
  onSlide('max')

  function onSlide (bound) {
    var value = document.querySelector('#' + bound + '-ppb').value
    document.querySelector('#' + bound + '-ppb-output').innerHTML = value + '%'

    var min = document.querySelector('#min-ppb').value
      , max = document.querySelector('#max-ppb').value

    var p1 = school.lead[2010].filter(function (sample) {
               var l = parseFloat(sample.lead)
               return l >= min && l <= max
             }).length / school.lead[2010].length
      , p2 = school.lead[2016].filter(function (sample) {
               var l = parseFloat(sample.lead)
               return l >= min && l <= max
             }).length / school.lead[2016].length

    gauge2010.update(Math.round(p1 * 100))
    gauge2016.update(Math.round(p2 * 100))

  }
}
