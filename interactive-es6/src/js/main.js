import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import d3 from 'd3'
import { AUSCartogram } from './campaignMap'
import { BarGraph } from './barGraph'
import campaignData from './data/events-categorised.json!json'
import iframeMessenger from 'guardian/iframe-messenger'

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    var laborLeader = 'Kevin Rudd'
    var coalitionLeader = 'Tony Abbott'

    var visitsByLeader = d3.nest()
      .key((d) => d.politician)
      .entries(campaignData.sheets.events)

    var politicianMap = d3.map(visitsByLeader, (d) => d.key)

    new AUSCartogram("#campaign-map-coalition", politicianMap.get(coalitionLeader), "#005689")
    new AUSCartogram("#campaign-map-labor", politicianMap.get(laborLeader), '#b51800')

    new BarGraph("#promises-labor", politicianMap.get(laborLeader), "#005689")
    new BarGraph("#promises-coalition", politicianMap.get(coalitionLeader), '#b51800')

    iframeMessenger.enableAutoResize()
}
