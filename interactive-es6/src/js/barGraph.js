import d3 from 'd3'

function barGraph(el, data, maxVisits, maxAmount, colour) {
    new BarGraph(el, data, maxVisits, colour)
}


export class BarGraph {
    constructor(el, data, maxVisits, maxAmount, colour) {
        this.el = el;
        this.svg = d3.select(el).append("svg");
        this.data = data.filter((d) => !(d.key === "general"))
        var self = this;
        this.mode = 'count'
        this.status = 'all'
        this.setup(maxVisits, maxAmount, colour)
    }

    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        var height = document.querySelector(this.el).getBoundingClientRect().height

        return {width: width, height: height}
    }

    setup(maxVisits, maxAmount, colour) {
        var self = this;
        var visitScale = d3.scale.linear().domain([0, maxVisits])
        this.graphMargin = {top: 30, right: 20, bottom: 100, left: 70};
        this.graphHeight = this.elDimensions.height - this.graphMargin.top - this.graphMargin.bottom;
        this.graphWidth = this.elDimensions.width - this.graphMargin.left - this.graphMargin.right;
        this.graph = this.svg
          .attr("width", this.graphWidth + this.graphMargin.left + this.graphMargin.right)
          .attr("height", this.graphHeight + this.graphMargin.bottom + this.graphMargin.top)

        this.x = d3.scale.ordinal()
          .rangeRoundBands([this.graphMargin.left,this.graphWidth + this.graphMargin.left], .2)

        this.yScales = { 
          sum: d3.scale.linear().range([this.graphHeight, this.graphMargin.top]).domain([0, maxAmount]).nice(),
          count: d3.scale.linear().range([this.graphHeight, this.graphMargin.top]).domain([0, maxVisits]).nice(),
        }

        this.graph.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${this.graphHeight})`)

        this.graph.append("g")
              .attr("class", "y axis")
              .attr("transform", `translate(${this.graphMargin.left},0)`)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -60)
              .attr("x", -this.graphMargin.top)
              .attr("dy", ".71em")
              .attr("class", "graph-text")
              .style("text-anchor", "end")

        this.bars = this.graph.selectAll(".bars")
            .data(this.data)
            .enter().append("rect")
              .attr("class", "bars")
              .attr("fill", colour)
              .on("mouseover", (d) => this.renderTooltip(d))
              .on("mouseout", () => this.hideTooltip())

        this.render()
    }

    render() {
      this.data.sort((a,b) => d3.descending(a.values['all'][this.mode], b.values['all'][this.mode]))

      this.y = this.yScales[this.mode]

      this.x.domain(this.data.map((d) => d.key))

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickPadding(0)

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .ticks(5)
        .tickPadding(5)
        .tickFormat((d) => (this.mode === "sum") ? `$${+d/1000000000}B` : d)

      this.bars
        .transition()
        .attr("x", (d) => this.x(d.key))
        .attr("width", this.x.rangeBand())
        .attr("y", (d) => this.y(d.values[this.status][this.mode]))
        .attr("height", (d) => this.graphHeight - this.y(d.values[this.status][this.mode]) )

      this.graph.select("g.x.axis")
        .call(this.xAxis)
          .selectAll("text")
            .attr("dx", "-.5em")
            .attr("transform", "rotate(-50)")
            .style("text-anchor", "end")

      this.graph.select("g.y.axis")
        .call(this.yAxis)

      if (this.mode === 'sum') {
        this.graph.select(".graph-text").text("$ Total");
      } else {
        this.graph.select(".graph-text").text("No. announcements");
      }
    }

    renderTooltip(data) {
      if (!this.tooltip) {
          var tooltip = d3.select(this.el).append("div")
              .attr("class", "tooltip")
          this.tooltip = document.querySelector(`${this.el} .tooltip`)
      }
      var msg = (this.mode === "sum") ? `$${data.values[this.status].sum/1000000000}B` : data.values[this.status].count

      this.tooltip.innerHTML =
          '<span class="tooltip__spout"></span>' +
          `<h4>${msg}</h4>`

      var rect = this.tooltip.getBoundingClientRect();
      var y = this.y(data.values[this.status][this.mode])
      var x = this.x(data.key) + this.x.rangeBand()/2
      this.tooltip.style.visibility = 'visible';
      var elDimensions = this.elDimensions;
      this.tooltip.style.top = `${y - rect.height - 8}px`;
      var left = x - rect.width/2 - 2;
      var maxLeft = elDimensions.width - rect.width;
      this.tooltip.style.left = `${left}px`

      var spoutOffset = rect.width/2;
      this.tooltip.querySelector('.tooltip__spout').style.left = spoutOffset + 'px';
      this.tooltip.className = 'tooltip tooltip--above'
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.style.visibility = 'hidden';
    }

    toggleMode(mode) {
      this.mode = mode
      this.render()
    }

    filterStatus(status) {
      this.status = status
      this.render()
    }

    resize() {
      this.graphWidth = this.elDimensions.width - this.graphMargin.left - this.graphMargin.right;
      this.graph.attr("width", this.graphWidth + this.graphMargin.left + this.graphMargin.right)
      this.x.rangeRoundBands([this.graphMargin.left,this.graphWidth + this.graphMargin.left], .2)
      this.render()
    }
}
