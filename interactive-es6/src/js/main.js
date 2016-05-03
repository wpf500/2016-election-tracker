import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import d3 from 'd3'
import { AUSCartogram } from './campaignMap'
import { BarGraph } from './barGraph'
import { TableSortable } from './tableSortable'
import animateSprite from './vendor/jquery.animateSprite.min'
import sprites from './sprites'
import campaignData from './data/events-categorised.json!json'
import iframeMessenger from 'guardian/iframe-messenger'

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    var req;
    req = reqwest({
      url: 'http://interactive.guim.co.uk/docsdata/1kqqnkbUmWNzzODlpL96aYfhyhfCPZkfmj9kUBaoFj3M.json',
      type: 'json',
      crossOrigin: true,
      success: resp => handleData(req.request.getResponseHeader('Last-Modified'), resp)
    });
    iframeMessenger.enableAutoResize()
}

function handleData(date, data) {
    var dateFormat = d3.time.format("%A %B %d, %H:%M AEST")
    d3.select("#timeStamp").text(dateFormat(new Date(date)))

    console.log(date)

    var laborLeader = 'Kevin Rudd'
    var coalitionLeader = 'Tony Abbott'

    var dataByLeader = d3.nest()
      .key((d) => d.politician)
      .entries(data.sheets.events)

    var visitsByLeader = d3.nest()
      .key((d) => d.politician)
      .key((d) => d.electorate)
      .key((d) => d.event)
      .entries(data.sheets.events)

    var dataByCategory = d3.nest()
      .key((d) => d.politician)
      .key((d) => d.category)
      .rollup((l) => {
        var marginal = l.filter((a) => a.status === 'Marginal')
        var fairlySafe = l.filter((a) => a.status === 'Fairly safe')
        var safe = l.filter((a) => a.status === 'Safe')
        return { 
          all: {count: l.length, sum: d3.sum(l, (a) => +a["dollars-announced"])},
          safe: {count: safe.length, sum: d3.sum(safe, (a) => +a["dollars-announced"]) },
          marginal: {count: marginal.length, sum: d3.sum(marginal, (a) => +a["dollars-announced"]) },
          fairlySafe: {count: fairlySafe.length, sum: d3.sum(fairlySafe, (a) => +a["dollars-announced"]) }
        }
      })
      .entries(data.sheets.events)

    var maxVisitsByCategory = d3.max(dataByCategory, (p) => d3.max(p.values, (d) => d.values.all.count))
    var maxAmountByCategory = d3.max(dataByCategory, (p) => d3.max(p.values, (d) => d.values.all.sum))

    var maxVisitsByElectorate = d3.max(visitsByLeader, (p) => d3.max(p.values, (d) => d.values.length))

    var databyLeaderMap = d3.map(dataByLeader, (d) => d.key)
    var categoriesMap = d3.map(dataByCategory, (d) => d.key)
    var electorateMap = d3.map(visitsByLeader, (d) => d.key)


    console.log(visitsByLeader, dataByCategory)

    var numElectorates = {
      labor: electorateMap.get(laborLeader).values.length,
      coalition: electorateMap.get(coalitionLeader).values.length
    }

    var sumCost = {
      labor: d3.sum(databyLeaderMap.get(laborLeader).values, (d) => +d["dollars-announced"]),
      coalition: d3.sum(databyLeaderMap.get(coalitionLeader).values, (d) => +d["dollars-announced"])
    }

    var categoryFocus = {
      labor: categoriesMap.get(laborLeader).values.reduce((a,b) => a.values.all.count > b.values.all.count ? a : b),
      coalition: categoriesMap.get(coalitionLeader).values.reduce((a,b) => a.values.all.count > b.values.all.count ? a : b)
    }

    var categoryCost = {
      labor: categoriesMap.get(laborLeader).values.reduce((a,b) => a.values.all.sum > b.values.all.sum ? a : b),
      coalition: categoriesMap.get(coalitionLeader).values.reduce((a,b) => a.values.all.sum > b.values.all.sum ? a : b)
    }

    d3.select("#summary-labor .summary-text")
      .html(summaryText(numElectorates.labor, 53, d3.format(".3r")(sumCost.labor/1000000000), categoryFocus.labor.key, categoryCost.labor.key))
    d3.select("#summary-coalition .summary-text")
      .html(summaryText(numElectorates.coalition, 53, d3.format(".3r")(sumCost.coalition/1000000000), categoryFocus.coalition.key, categoryCost.coalition.key))

    var coalitionMap = new AUSCartogram("#campaign-map-coalition", electorateMap.get(coalitionLeader).values, maxVisitsByElectorate, "#005689")
    var laborMap = new AUSCartogram("#campaign-map-labor", electorateMap.get(laborLeader).values, maxVisitsByElectorate, '#b51800')

    var laborBar = new BarGraph("#promises-labor", categoriesMap.get(laborLeader).values, maxVisitsByCategory, maxAmountByCategory, "#005689")
    var coalitionBar = new BarGraph("#promises-coalition", categoriesMap.get(coalitionLeader).values, maxVisitsByCategory, maxAmountByCategory, '#b51800')
   
    var promisesBtn = d3.select("#toggle-promises")
      .on("click", () => {
        laborBar.toggleMode()
        coalitionBar.toggleMode()
        if (promisesBtn.attr("data-mode") === "sum") {
          promisesBtn.attr("data-mode", "count")
            .text("$ Total")
        } else {
          promisesBtn.attr("data-mode", "sum")
            .text("No. announcements")
        }
      })

    var statusBtn = d3.selectAll(".toggle-status a")
      .on("click", function() {
        var status = d3.select(this).attr("data-status")
        laborBar.filterStatus(status)
        coalitionBar.filterStatus(status)
      })

    new TableSortable("#announcements-detail", data.sheets.events)
    setupAnimations()
    shortenBlink()
    turnbullBlink()

    var to=null
    var lastWidth = document.querySelector(".interactive-container").getBoundingClientRect()
    window.addEventListener('resize', () => {
      var thisWidth = document.querySelector(".interactive-container").getBoundingClientRect()
      if (lastWidth != thisWidth) {
        window.clearTimeout(to);
        to = window.setTimeout(resize(), 500)
      }
    })

    function resize() {
      coalitionMap.resize()
      laborMap.resize()
      coalitionBar.resize()
      laborBar.resize()
    }

    function summaryText(electorates, announcements, cost, categoryFocus, categoryCost) {
      var text = `Has visited ${electorates} electorates,` +
        ` and made ${announcements} announcements ` + 
        ` with an estimated total cost* of $${cost}bn. `

      if (categoryFocus === categoryCost) {
        text = text + `His major focus is ${categoryFocus}.`
      } else {
        text = text + `His major focus is ${categoryFocus}` +
          ` but has committed the most money to ${categoryCost}.`
      }
      return text
    }
}