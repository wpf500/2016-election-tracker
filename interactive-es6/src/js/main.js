import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import d3 from 'd3'
import { AUSCartogram } from './campaignMap'
import { BarGraph } from './barGraph'
import { TableSortable } from './tableSortable'
import campaignData from './data/events-categorised.json!json'
import iframeMessenger from 'guardian/iframe-messenger'

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    reqwest({
      url: 'http://interactive.guim.co.uk/docsdata/1kqqnkbUmWNzzODlpL96aYfhyhfCPZkfmj9kUBaoFj3M.json',
      type: 'json',
      crossOrigin: true,
      success: resp => handleData(resp)
    });
    iframeMessenger.enableAutoResize()

}

function handleData(data) {
    var laborLeader = 'Kevin Rudd'
    var coalitionLeader = 'Tony Abbott'
    var visitsByLeader = d3.nest()
      .key((d) => d.politician)
      .key((d) => d.electorate)
      .entries(data.sheets.events)

    var dataByCategory = d3.nest()
      .key((d) => d.politician)
      .key((d) => d.category)
      .rollup((l) => { return { count: l.length, sum: d3.sum(l, (a) => +a["dollars-announced"])}})
      .entries(data.sheets.events)

    var maxVisitsByCategory = d3.max(dataByCategory, (p) => d3.max(p.values, (d) => d.values.count))
    var maxAmountByCategory = d3.max(dataByCategory, (p) => d3.max(p.values, (d) => d.values.sum))

    var maxVisitsByElectorate = d3.max(visitsByLeader, (p) => d3.max(p.values, (d) => d.values.length))

    var categoriesMap = d3.map(dataByCategory, (d) => d.key)
    var electorateMap = d3.map(visitsByLeader, (d) => d.key)
    new AUSCartogram("#campaign-map-coalition", electorateMap.get(coalitionLeader).values, maxVisitsByElectorate, "#005689")
    new AUSCartogram("#campaign-map-labor", electorateMap.get(laborLeader).values, maxVisitsByElectorate, '#b51800')

    new BarGraph("#promises-labor", categoriesMap.get(laborLeader).values, maxVisitsByCategory, "#005689")
    new BarGraph("#promises-coalition", categoriesMap.get(coalitionLeader).values, maxVisitsByCategory, '#b51800')

    new TableSortable("#announcements-detail", data.sheets.events)
}
