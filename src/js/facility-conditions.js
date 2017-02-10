var Chartist = require('chartist')
  , map = require('./map-search')
  , d3 = require('d3')
  , fciScale = require('./fci-scale')

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
    chartPadding: {
      top: 20
    },
    plugins: [
      Chartist.plugins.legend({
        clickable: false,
        position: document.querySelector('.demo-container .legend-container')
      })
    ]
  })
}

function fci (data) {
  var svg = d3.select('.fci-gauge svg')
    , margin = 25
    , width = d3.select('.fci-gauge').node().offsetWidth - (margin * 2)

  svg.append('defs')
     .append('clipPath')
       // .attr('transform', 'translate(' + margin + ',' + margin + ')')
       .attr('id', 'rect-clip')
       .append('rect')
         .attr('height', 40)
         .attr('width', width)
         .attr('rx', 10)
         .attr('ry', 10)

  var g = svg.append('g')
             .attr('transform', 'translate(' + margin + ',' + margin + ')')
    , x = d3.scale.linear()
                  .domain([0, 1])
                  .range([0, width])
    , axis = g.append('g').attr('class', 'axis')
                          .attr('transform', 'translate(0, 45)')
    , scale = fciScale()
    , ticks = [0, 1]

  ticks.splice.apply(ticks, [1, 0].concat(scale.domain()))

  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom')
                    .tickSize(13)
                    .tickValues(ticks)
                    .tickFormat(d3.format('%'))
    , rectGrp = g.selectAll('g.rect')
                 .data(function (d) { return [d] })

  rectGrp.enter()
         .append('g')
         .attr('class', 'rect')
         .attr('clip-path', 'url(#rect-clip)')

  var rect = rectGrp.selectAll('rect')
                    .data(scale.range().map(function (color) {
                      var d = scale.invertExtent(color)
                      if (d[0] == null) d[0] = x.domain()[0]
                      if (d[1] == null) d[1] = x.domain()[1]
                      return d
                    }))

  rect.exit().remove()
  rect.enter()
      .append('rect')
        .attr('y', 0)
        .attr('height', 40)

  rect.attr('x', function (d) { return x(d[0]) })
      .attr('width', function (d) { return x(d[1]) - x(d[0]) })
      .style('fill', function (d) { return scale(d[0]).color })

  var needles = g.selectAll('g.needle')
                 .data(function (d) {
                   return [2012, 2015].map(function (year) {
                     return {
                       year: year,
                       fci: x(data[year + ' Facility Condition Index [FCI]'])
                     }
                   })
                 })
                 .enter()
                 .append('g')
                 .classed('needle', true)
                 .attr('transform', function (d) {
                   return 'translate(' + d.fci + ',35)'
                 })

  needles.append('path')
         .attr('d', d3.svg.symbol().type('triangle-up').size(200))

  needles.append('text')
         .text(function (d) {
           return d.year
         })
         .attr('y', -10)
         .attr('x', -10)

  axis.call(xAxis)

  d3.select('.fci-rating-rank-2012')
    .text(scale(data['2012 Facility Condition Index [FCI]']).text)
    .style('color', scale(data['2012 Facility Condition Index [FCI]']).color)

  d3.select('.fci-rating-rank-2015')
    .text(scale(data['2015 Facility Condition Index [FCI]']).text)
    .style('color', scale(data['2015 Facility Condition Index [FCI]']).color)
}

module.exports = function () {
  map()

  var school = window.data.school

  if (school) {
    // Draw demographics for this school
    demographics(window.data.school)
    fci(window.data.school)
  }
}
