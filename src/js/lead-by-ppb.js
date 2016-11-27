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

  var svg = d3.select('#vis').select('svg')
    , margin = 20
    , diameter = svg.node().getBoundingClientRect().width
    , g = svg.append('g')
             .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')')
  draw()

  function draw () {
    var data = d3.nest()
                 .key(function (d) { return d.ulcs })
                 .entries(window.data.lead.filter(function (sample) {
                   return s(sample.lead) === range.node().value
                 }))
      , pack = d3.layout.pack()
                        .padding(2)
                        .size([diameter - margin, diameter - margin])
                        .value(function (d) { return d.lead })
                        .children(function (d) {
                          return d.values
                        })
      , root = {values: data}
      , nodes = pack.nodes(root)
      , focus = root
      , view

      var circle = g.selectAll('circle')
                    .data(nodes, function (d) {
                      return d.parent ? d.children ? d.children[0].ulcs : d.id : 'root'
                    })

      circle.enter()
            .append('circle')

      circle.exit().remove()

      circle.attr('class', function (d) {
              return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"
            })
            .on('click', function (d) {
              if (focus !== d) zoom(d), d3.event.stopPropagation()
            })

      // var text = svg.selectAll('text')
      //     .data(nodes)
      //   .enter().append("text")
      //     .attr("class", "label")
      //     .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      //     .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      //     .text(function(d) { return d.name; });

      // var node = svg.selectAll('circle,text')

      zoomTo([root.x, root.y, root.r * 2 + margin])

      function zoom (d) {
        var focus0 = focus
        focus = d
        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween('zoom', function (d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin])
              return function(t) { zoomTo(i(t)) };
            })

        // transition.selectAll("text")
        //   .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        //     .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        //     .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        //     .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }


      function zoomTo (v) {
        var k = diameter / v[2]
        view = v
        circle.attr('transform', function (d) {
          return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'
        })
        circle.attr('r', function (d) {
          return d.r * k
        })
      }
  }
}
