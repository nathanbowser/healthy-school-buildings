
function demographicsData (data) {
  var offset = 0

  return demo = [
    ['White', data['whitenothispanic-count'], data['whitenothispanic-percentage']],
    ['Native Hawaiian or Other Pacific', data['nativehawaiianorotherpacificislandernothispanic-count'], data['nativehawaiianorotherpacificislandernothispanic-percentage']],
    ['Multi Race/Other', data['multi-racetwoormoreracesnothispanic-count'], data['multi-racetwoormoreracesnothispanic-percentage']],
    ['Hispanic', data['hispanicanyrace-count'], data['hispanicanyrace-percentage']],
    ['African American', data['blackafricanamericannothispanic-count'], data['blackafricanamericannothispanic-percentage']],
    ['Asian', data['asiannothispanic-count'], data['asiannothispanic-percentage']],
    ['American Indian/Alaskan', data['americanindianalaskannativenothispanic-count'], data['americanindianalaskannativenothispanic-percentage']]
  ].filter(function (d) {
    return d[1]
  }).sort(function (a, b) {
    return b[1] - a[1]
  }).map(function (d) {
    d[3] = offset
    d[1] = parseInt(d[1], 10)
    offset += parseInt(d[1], 10)
    return d
  }).filter(function (d) {
    return d[1]
  })

}
