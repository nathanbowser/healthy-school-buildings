var d3 = require('d3')

module.exports = function () {
  return d3.scale.threshold()
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
}
