import d3 from 'd3'

export class EventsList {
    constructor(el, data) {
      this.el = el;
      this.list = d3.select(el).append("ul");
      this.data = data
      this.dateFormat = d3.time.format("%d/%m/%Y")
      var self = this;
    }

    render(date) {
      var data = this.data.filter((d) => { 
        var date1 = this.dateFormat.parse(d.key)
        return (date.getDay() === date1.getDay()) && (date.getMonth() === date1.getMonth())
      })
      this.list.selectAll("li").remove()

      var li = this.list.selectAll("li.event")
        .data(data)
        .enter()
        .append("li")
        .attr("class", "event")

      li.append("h4")
        .attr("class", "electorate")
        .text((d) => d.values[0].values[0].electorate)

      event = li.selectAll("ul.announcements")
        .data((d) => d.values)
        .enter()
        .append("ul")
        .attr("class", "announcements")

      event.selectAll("li.announcement")
        .data((d) => d.values)
        .enter()
        .append("li")
        .attr("class", "announcement")
        .text((d) => d.announcement)

    }
}
