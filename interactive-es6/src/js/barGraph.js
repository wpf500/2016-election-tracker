import d3 from 'd3'

export class BarGraph {
    constructor(el, data, colour) {
        this.el = el;
        this.svg = d3.select(el).append("svg");
        var self = this;
        var dataByCategory = d3.nest()
          .key((d) => d.category)
          .entries(data.values)
        this.render(dataByCategory, colour)
    }

    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        var height = document.querySelector(this.el).getBoundingClientRect().height

        return {width: width, height: height}
    }

    render(data, colour) {
        var self = this;
        var maxVisits = d3.max(data, (d) => d.values.length)
        var visitScale = d3.scale.linear().domain([0, maxVisits])
        var graphMargin = {top: 20, right: 10, bottom: 30, left: 60};
        var graphHeight = this.elDimensions.height - graphMargin.top - graphMargin.bottom;
        var graphWidth = this.elDimensions.width - graphMargin.left - graphMargin.right;
        var graph = this.svg
          .attr("width", graphWidth + graphMargin.left + graphMargin.right)
          .attr("height", graphHeight + graphMargin.bottom + graphMargin.top)

        data.sort((a,b) => d3.descending(a.values.length, b.values.length))

        var x = d3.scale.ordinal()
          .rangeRoundBands([graphMargin.left,graphWidth], .2)
          .domain(data.map((d) => d.key))

        var y = d3.scale.linear()
          .range([graphHeight, graphMargin.top])
          .domain([0, maxVisits])

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickPadding(-graphMargin.left)

          graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graphHeight + ")")
            .call(xAxis)

        graph.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .attr("class", "graphText")
              .style("text-anchor", "end")
              .text("No. announcements");

        graph.selectAll(".bars")
            .data(data)
            .enter().append("rect")
              .attr("class", "bars")
              .attr("x", function(d) { return x(d.key); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.values.length); })
              .attr("height", function(d) { return graphHeight - y(d.values.length); })
              .attr("fill", colour)      
    }
}
