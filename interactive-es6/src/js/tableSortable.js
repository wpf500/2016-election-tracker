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
          var party = (d.politician === 'Malcolm Turnbull') ? "coalition" : 'labor'
          var tr = $("<tr></tr>").appendTo(tbody)
          $(`<td>${d.politician}</td>`).appendTo(tr).addClass("politician").addClass(party + "-row")
          $(`<td>${d.electorate}</td>`).appendTo(tr)
          $(`<td>${d.event}</td>`).appendTo(tr)          
          $(`<td>${d.announcement}</td>`).appendTo(tr)
          // $(`<td>${amtFormat(d['dollars-announced'])}</td>`).appendTo(tr).attr("data-sort-value", d['dollars-announced'])
          $(`<td>${d.status}</td>`).appendTo(tr).addClass("status")
          $(`<td>${d.date}</td>`).appendTo(tr).attr("data-value", moment(d.date, "YYYY-MM-DD")).addClass("date")
        })

        this.table.footable()                              
    }
}
