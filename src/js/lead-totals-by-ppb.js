var d3 = require('d3')

module.exports = function () {
  var s = d3.scale.threshold().domain([3, 5, 10, 15, 20])
                              .range(['Less than 3', '3 - 5', '5 - 10', '10 - 15', '15 - 20', 'More than 20'])
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
    , center = {
      x: width / 2,
      y: height / 2
    }
    , damper = 0.102
    , svg = d3.select('#vis')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
    , bubbles = null
    , nodes = []

  var force = d3.layout.force()
                       .size([width, height])
                       .charge(function (d) {
                         return -Math.pow(d.radius, 2.0) / 7
                       })
                       .gravity(-0.01)
                       .friction(.9)

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
                            .exponent(1)
                            .range([20, 75])

  draw()

  function draw () {
    function createNodes (data) {
      var nodes = data.filter(function (d) {
                         return d[range.node().value] > 0
                       })
                      .map(function (d) {
                        d.id = d.year + '-' + d.ulcs
                        d.radius = radiusScale(d[range.node().value])
                        d.x = Math.random() * 900
                        d.y = Math.random() * 800
                        return d
                      })

      // sort them to prevent occlusion of smaller nodes.
      nodes.sort(function (a, b) { return b.collected - a.collected })

      return nodes
    }

    var max = d3.max(window.data.lead, function (d) {
                  return d[range.node().value]
                })

    radiusScale.domain([0, max])

    nodes = createNodes(window.data.lead)

    force.nodes(nodes)

    bubbles = svg.selectAll('.bubble')
                 .data(nodes, function (d) {
                   return d.id
                 })

    bubbles.enter()
           .append('circle')

    bubbles.exit().remove()

    bubbles.classed('bubble', true)
           .attr('r', 0)
           .attr('fill', '#beccae')
           .attr('stroke', d3.rgb('beccae').darker())
           .attr('stroke-width', 2)

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles
           .attr('r', function (d) { return d.radius })

    function moveToCenter (alpha) {
      return function (d) {
        d.x = d.x + (center.x - d.x) * damper * alpha
        d.y = d.y + (center.y - d.y) * damper * alpha
      }
    }

    force.on('tick', function (e) {
           bubbles.each(moveToCenter(e.alpha))
                  .attr('cx', function (d) { return d.x })
                  .attr('cy', function (d) { return d.y })
         })
         .start()
  }

}
