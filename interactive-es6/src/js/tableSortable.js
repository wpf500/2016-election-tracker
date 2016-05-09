import d3 from 'd3'
import jquery from 'jquery'
import moment from 'moment'
import fooTable from './vendor/fooTable.min'

export class TableSortable {
    constructor(el, data) {
        this.el = el;
        this.table = $(`${el} .table`)
        var tbody = this.table.find('tbody')
        var amtFormat = d3.format("$,")

        data.forEach((d) => {
          var party = (d.politician === 'Tony Abbott') ? "coalition" : 'labor'
          var tr = $("<tr></tr>").appendTo(tbody)
          $(`<td>${d.politician}</td>`).appendTo(tr).addClass("politician").addClass(party + "-row")
          $(`<td>${d.electorate}</td>`).appendTo(tr)
          $(`<td>${d.announcement}</td>`).appendTo(tr)
          $(`<td>${amtFormat(d['dollars-announced'])}</td>`).appendTo(tr).attr("data-sort-value", d['dollars-announced'])
          $(`<td>${d.status}</td>`).appendTo(tr).addClass("status")
          $(`<td>${d.date}</td>`).appendTo(tr).attr("data-value", moment(d.date, "DD/MM/YYYY")).addClass("date")
        })

        // row.append("td")
        //   .text((d) => d.politician)
        //   // .attr("class", "leader-column")
        //   .style("color", (d) => (d.politician === 'Tony Abbott') ? "#005689" : '#b51800')
        //   .style("white-space", "nowrap")
        // row.append("td")
        //   .text((d) => d.electorate)
        //   .style("white-space", "nowrap")
        // row.append("td")
        //   .text((d) => d.announcement)
        // row.append("td")
        //   .text((d) => amtFormat(d['dollars-announced']))
        //   .style("text-align", "right")
        // row.append("td")
        //   .text((d) => d.status) 
        //   .style("white-space", "nowrap")
        // row.append("td")
        //   .text((d) => d.date)

        console.log(this.table)

        this.table.footable()                              
    }
}
