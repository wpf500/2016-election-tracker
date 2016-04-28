import d3 from 'd3'

export class BarGraph {
    constructor(el, data, maxVisits, colour) {
        this.el = el;
        this.svg = d3.select(el).append("svg");
        var self = this;
        this.render(data, maxVisits, colour)
    }

    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        var height = document.querySelector(this.el).getBoundingClientRect().height

        return {width: width, height: height}
    }

    render(data, maxVisits, colour) {
        var self = this;
        var mode = "count"
        var visitScale = d3.scale.linear().domain([0, maxVisits])
        var graphMargin = {top: 20, right: 10, bottom: 100, left: 60};
        var graphHeight = this.elDimensions.height - graphMargin.top - graphMargin.bottom;
        var graphWidth = this.elDimensions.width - graphMargin.left - graphMargin.right;
        var graph = this.svg
          .attr("width", graphWidth + graphMargin.left + graphMargin.right)
          .attr("height", graphHeight + graphMargin.bottom + graphMargin.top)

        data.sort((a,b) => d3.descending(a.values[mode], b.values[mode]))

        var x = d3.scale.ordinal()
          .rangeRoundBands([graphMargin.left,graphWidth], .2)
          .domain(data.map((d) => d.key))
        var y = d3.scale.linear()
          .range([graphHeight, graphMargin.top])
          .domain([0, maxVisits])

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickPadding(0)

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(5)
          .tickPadding(5)

          graph.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${graphHeight + 1})`)
            .call(xAxis)
            .selectAll("text")
              .attr("dx", "-.5em")
              .attr("transform", "rotate(-50)")
              .style("text-anchor", "end")

        graph.append("g")
              .attr("class", "y axis")
              .attr("transform", `translate(${graphMargin.left + 5},0)`)
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -40)
              .attr("x", -graphMargin.top)
              .attr("dy", ".71em")
              .attr("class", "graph-text")
              .style("text-anchor", "end")
              .text("No. announcements");

        graph.selectAll(".bars")
            .data(data)
            .enter().append("rect")
              .attr("class", "bars")
              .attr("x", function(d) { return x(d.key); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.values[mode])})
              .attr("height", function(d) { return graphHeight - y(d.values[mode]); })
              .attr("fill", colour)      
    }
}
