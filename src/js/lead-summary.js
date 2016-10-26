var Chartist = require('chartist')

module.exports = function () {
  var chartData = window.data.lead.map(function (l) {
    return {
      ulcs: l.ULCS,
      percentage: l.Above / l['Total # of Samples Collected']
    }
  })

  new Chartist.Bar('.ct-chart', {
    labels: chartData.map(function (l) {
      return l.ulcs
    }),
    series: [chartData.map(function (l) {
      return l.percentage
    })]
  })

}
