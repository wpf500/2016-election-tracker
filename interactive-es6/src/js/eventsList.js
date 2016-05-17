import d3 from 'd3'

export class EventsList {
    constructor(el, data) {
      this.el = el;
      this.list = d3.select(el).append("ul");
      this.data = data
      this.dateFormat = d3.time.format("%Y-%m-%d")
      var self = this;
    }

    render(date) {
      var data = this.data.filter((d) => { 
        var date1 = this.dateFormat.parse(d.key)
        if (date && date1) {
          return (date.getDate() === date1.getDate()) && (date.getMonth() === date1.getMonth())
        }
        else { return false }
      })
      this.list.selectAll("li").remove()

      var li = this.list.selectAll("li.electorate")
        .data(data[0].values)
        .enter()
        .append("li")
        .attr("class", "electorate")

      li.append("h4")
        .attr("class", "electorate")
        .text((d) => d.key)

      // li.append("p")
      //   .attr("class", "summary")
      //   .text((d) => d.values[0].values[0].summary)

      var event = li.selectAll("ul.events")
        .data((d) => d.values)
        .enter()
        .append("ul")
        .attr("class", "events")

      event.append("li")
        .attr("class", "event")
        .text((d) => d.values[0].summary)

    }
}
