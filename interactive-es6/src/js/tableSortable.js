import d3 from 'd3'
import jquery from 'jquery'
import fooTable from './vendor/fooTable.core.min'
import fooSorting from './vendor/fooTable.sorting.min'

export class TableSortable {
    constructor(el, data) {
        this.el = el;
        this.table = d3.select(el).append("table")
          .attr("data-sorting", "true")
        var amtFormat = d3.format("$,2f")
        var header = this.table.append("thead").append("tr")
        header.append("th").text("Leader")
        header.append("th").text("Electorate")
        header.append("th").text("Description").attr("data-hide", "phone")
        header.append("th").text("Dollars Announced")
          .attr("data-hide", "phone,tablet")
          .style("text-align", "right")
        header.append("th").text("Seat Status").attr("data-hide", "phone,tablet")
        header.append("th").text("Date").attr("data-hide", "phone")

        var row = this.table.append("tbody")
          .selectAll("tr")
          .data(data)
          .enter()
          .append("tr")
          .attr("data-expanded", true)

        row.append("td")
          .text((d) => d.politician)
          .attr("class", "leader-column")
          .style("color", (d) => (d.polician === 'Tony Abbott') ? "#005689" : '#b51800')
          .style("white-space", "nowrap")
        row.append("td")
          .text((d) => d.electorate)
          .style("white-space", "nowrap")
        row.append("td")
          .text((d) => d.announcement)
        row.append("td")
          .text((d) => amtFormat(d['dollars-announced']))
          .style("text-align", "right")
        row.append("td")
          .text((d) => d.status) 
          .style("white-space", "nowrap")
        row.append("td")
          .text((d) => d.date)

        console.log($(`${el} table`))
        // $(`${el} table`).footable()                              
    }
}
