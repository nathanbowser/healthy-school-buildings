var facilityConditions = require('./facility-conditions')
  , leadsummary = require('./lead-summary')

if (document.querySelector('.facility-conditions')) {
  facilityConditions()
} else if (document.querySelector('body.lead-summary')) {
  leadsummary()
}
