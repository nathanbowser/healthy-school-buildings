var facilityConditions = require('./facility-conditions')
  , leadsummary = require('./lead-summary')
   leadByPpb = require('./lead-by-ppb')

if (document.querySelector('.facility-conditions')) {
  facilityConditions()
} else if (document.querySelector('body.lead-summary')) {
  leadsummary()
} else if (document.querySelector('body.lead-by-ppb')) {
  leadByPpb()
}
