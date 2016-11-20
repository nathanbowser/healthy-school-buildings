var Chartist = require('chartist')
  , d3 = require('d3')

window.Chartist = Chartist
require('chartist-plugin-axistitle')
require('chartist-plugin-tooltips')

module.exports = function () {
  // var reduced = window.data.lead[2016].reduce(function (p, c) {
  //   if (p[c.ULCS]) {
  //     p[c.ULCS].samples += parseInt(c['Total # of Samples Collected'], 10)
  //     p[c.ULCS].above += parseInt(c.Above, 10)
  //   } else {
  //     p[c.ULCS] = {
  //       ulcs: c.ULCS,
  //       name: c['School Name'],
  //       samples: parseInt(c['Total # of Samples Collected'], 10),
  //       above: parseInt(c.Above, 10)
  //     }
  //   }
  //   return p
  // }, {})

  // var _data = Object.keys(reduced).map(function (key) {
  //   return reduced[key]
  // })

  // new Chartist.Bar('.ct-chart', {
  //   labels: _data.map(function (l) {
  //     return l.name + ' (' + l.ulcs + ')'
  //   }),
  //   series: [_data.map(function (l) {
  //     return l.above / l.samples
  //   })]
  // }, {
  //   chartPadding: {
  //     bottom: 20
  //   },
  //   horizontalBars: true,
  //   seriesBarDistance: 100,
  //   axisX: {
  //     scaleMinSpace: 40,
  //     labelInterpolationFnc: d3.format('%')
  //   },
  //   axisY: {
  //     offset: 250
  //   },
  //   plugins: [
  //     Chartist.plugins.tooltip({
  //       class: 'chartist-tooltip',
  //       tooltipFnc: function(_, value) {
  //         return d3.format('%')(value)
  //       }
  //     }),
  //     Chartist.plugins.ctAxisTitle({
  //       axisX: {
  //           axisTitle: 'Percentage of Samples Elevated',
  //           axisClass: 'ct-axis-title',
  //           offset: {
  //               x: 0,
  //               y: 40
  //           },
  //           textAnchor: 'middle'
  //       },
  //       axisY: {}
  //     })
  //  ]
  // })
}
