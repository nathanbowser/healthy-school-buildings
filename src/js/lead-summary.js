var d3 = require('d3')
  , _tooltip = require('./tooltip')

module.exports = function () {

  d3.select('#all')
    .on('click', all)
  d3.select('#split')
    .on('click', split)

  var width = window.innerWidth
    , height = 900 // TODO Drive by lookup
    , tooltip = _tooltip('school-sample-summary', 300)
    , s = d3.scale.threshold().domain([3, 5, 10, 15, 20])
                              .range(['Less than 3', '3 - 5', '5 - 10', '10 - 15', '15 - 20', 'More than 20'])
    , center = {
      x: width / 2,
      y: height / 2
    }
    , yearCenters = {
      2010: { x: (width / 3), y: height / 2},
      2016: { x: (width / 3) * 2, y: height / 2}
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

  var fillColor = d3.scale.ordinal()
                          .domain([2010, 2016])
                          .range(['#d84b2a', '#beccae'])

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
                            .exponent(.68)
                            .range([2, 55])

  function createNodes (data) {
    var nodes = data.map(function (d) {
      d.id = d.year + '-' + d.ulcs
      d.radius = radiusScale(d.collected)
      d.x = Math.random() * 900
      d.y = Math.random() * 800
      return d
    })

    // sort them to prevent occlusion of smaller nodes.
    nodes.sort(function (a, b) { return b.collected - a.collected })

    return nodes
  }

  var data = window.data.lead[2016].summary.concat(window.data.lead[2010].summary)
    , max = d3.max(data, function (d) {
                return d.collected
              })

  radiusScale.domain([0, max])

  nodes = createNodes(data)

  force.nodes(nodes)

  bubbles = svg.selectAll('.bubble')
               .data(nodes, function (d) {
                 return d.id
               })

  bubbles.enter().append('circle')
    .classed('bubble', true)
    .attr('r', 0)
    .attr('fill', function (d) { return fillColor(d.year) })
    .attr('stroke', function (d) { return d3.rgb(fillColor(d.year)).darker() })
    .attr('stroke-width', 2)
    .on('mouseover', function (d) {
      d3.select(this).attr('stroke', 'black')
      var html = '<span class="name">School: </span><span class="value">' + d.name + ' (' + d.ulcs + ')</span><br/>' +
                 '<span class="name">Year: </span><span class="value">' + d.year + '</span><br />' +
                 '<span class="name">Total Samples: </span><span class="value">' + d.collected + '</span><br/>' +
                 '<hr />' +
                 (s.range().map(function (s) {
                   return '<span class="name">' + s + ': </span><span class="value">' + d[s] + '</span>'
                 }).join('<br />'))

      tooltip.show(html, d3.event)
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .attr('stroke', d3.rgb(fillColor(d.year)).darker())
      tooltip.hide()
    })

  // Fancy transition to make bubbles appear, ending with the
  // correct radius
  bubbles.transition()
         .duration(2000)
         .attr('r', function (d) { return d.radius })

  all()

  function all () {
    svg.selectAll('.year').remove()

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

  function split () {
    svg.selectAll('.year')
       .data([2010, 2016])
       .enter()
         .append('text')
         .attr('class', 'year')
         .attr('x', function (d, i) { return i == 0 ? width / 3 : width - (width / 4) })
         .attr('y', 40)
         .attr('text-anchor', 'middle')
         .text(String)

    function moveToYear (alpha) {
      return function (d) {
        var target = yearCenters[d.year];
        d.x = d.x + (target.x - d.x) * damper * alpha
        d.y = d.y + (target.y - d.y) * damper * alpha
      }
    }

    force.on('tick', function (e) {
           bubbles.each(moveToYear(e.alpha))
             .attr('cx', function (d) { return d.x })
             .attr('cy', function (d) { return d.y })
         })
         .start()
  }

}
