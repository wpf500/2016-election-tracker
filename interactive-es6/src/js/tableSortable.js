import d3 from 'd3'
import jquery from 'jquery'
import fooTable from './vendor/fooTable.core.min'
import fooSorting from './vendor/fooTable.sorting.min'

export class TableSortable {
    constructor(el, data) {
        console.log(fooTable)
        this.el = el;
        console.log(data)
        this.table = d3.select(el).append("table")
          .attr("data-sorting", "true")

        var header = this.table.append("thead").append("tr")
        header.append("th").text("Leader")
        header.append("th").text("Electorate")
        header.append("th").text("Description").attr("data-hide", "phone")
        header.append("th").text("Dollars Announced").attr("data-hide", "phone,tablet")
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
        row.append("td")
          .text((d) => d.electorate)
        row.append("td")
          .text((d) => d.description)
        row.append("td")
          .text((d) => d['dollars-announced'])
        row.append("td")
          .text((d) => d.status)  
        row.append("td")
          .text((d) => d.date)

        console.log($(`${el} table`))
        // $(`${el} table`).footable()                              
    }
}
