var d3 = require('d3')
  , _tooltip = require('./tooltip')

module.exports = function () {
  var s = d3.scale.threshold().domain([3, 5, 10, 15, 20])
                              .range(['Less than 3', '3 - 5', '5 - 10', '10 - 15', '15 - 20', 'More than 20'])
    , tooltip = _tooltip('school-sample-summary', 300)
    , range = d3.select('#thresholds')
                .on('change', draw)

  range.selectAll('option')
         .data(s.range())
         .enter()
           .append('option')
           .text(String)

  var width = window.innerWidth
    , height = 900 // TODO Drive by lookup
    , s = d3.scale.threshold().domain([3, 5, 10, 15, 20])
                              .range(['Less than 3', '3 - 5', '5 - 10', '10 - 15', '15 - 20', 'More than 20'])
    , svg = d3.select('#vis')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
    , bubble = d3.layout.pack()
                        .sort(null)
                        .size([width, height])
                        .padding(1.5)
                        .value(function (d) {
                          return d[range.node().value]
                        })

  draw()

  function draw () {
    var _data = window.data.lead.filter(function (d) {
                                  return d[range.node().value] > 0
                                })
      , node = svg.selectAll('.node')
                  .data(bubble.nodes({children: _data})
                              .filter(function (d) {
                                return !d.children
                              }))
      , enter = node.enter()
                    .append('g')
                      .attr('class', 'node')

    enter.append('circle')
         .attr('fill', '#beccae')
         .on('mouseover', function (d) {
           d3.select(this).attr('stroke', 'black')
           var html = '<span class="name">School: </span><span class="value">' + d.name + ' (' + d.ulcs + ')</span><br/>' +
                      '<span class="name">Year: </span><span class="value">' + d.year + '</span><br />' +
                      '<span class="name">Value: </span><span class="value">' + d[range.node().value] + '</span><br/>'

           tooltip.show(html, d3.event)
         })
         .on('mouseout', function (d) {
           d3.select(this)
             .attr('stroke', '')
           tooltip.hide()
         })

    node.exit().remove()

    node.attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')'
        })

    node.select('circle')
        .attr('r', function (d) {
          return d.r
        })

    enter.append('text')
         .attr('dy', '.3em')
         .style('text-anchor', 'middle')
         .style('pointer-events', 'none')

    node.select('text')
        .text(function (d) {
          return d[range.node().value]
        })
  }

}
