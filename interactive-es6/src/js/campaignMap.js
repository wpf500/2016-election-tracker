import hexagonsTopo from './data/hexagons.json!json'
import topojson from 'topojson'
import d3 from 'd3'
import textures from 'riccardoscalco/textures'

// import textures from 'riccardoscalco/textures'

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

var getDist = (x1,y1,x2,y2) => Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));

export class AUSCartogram {
    constructor(el, data, maxVisits, colour) {
        this.el = el;
        this.svg = d3.select(el).append("svg");
        this.map = this.svg.append('g');
        this.data = data
        this.maxVisits = maxVisits
        this.colour = colour
        this.colourScale = d3.interpolate("#fff", this.colour)
        this.visitScale = d3.scale.sqrt().domain([0, this.maxVisits])
        this.dateFormat = d3.time.format("%Y-%m-%d")

        var self = this;
        this.drawKey()
        this.renderHex()
        this.project()

    }

    project() { // do projections separately so we can rerender
        var self = this;
        this.initProjection()
        this.map.selectAll("path").attr("d", this.path)
        this.hexCentroids = {}
        this.hexPaths.each(d => this.hexCentroids[d.properties.electorate] = this.path.centroid(d));
    }

    initProjection() {
        var elDimensions = this.elDimensions;
        var scale = elDimensions.width * 1.2
        this.svg.attr("width", "100%")
            .attr("height", elDimensions.height)
        this.projection = d3.geo.mercator()
            .scale(scale)
            .translate([elDimensions.width / 2, elDimensions.height/2])
            .center([133, -27])
            .precision(10.0);
        if (!this.path) this.path = d3.geo.path();
        this.path.projection(this.projection)
    }

    initTextures() {
        if (!this.texture) {
            this.texture = textures.lines()
                .size(6)
                .strokeWidth(1)
                .stroke(this.colours.labor)
                .orientation("6/8")
                .background("#e1e1e1")
            this.svg.call(this.coalitionTexture);
        }
    }

    drawKey() {
        this.key = this.svg.append("g").attr("class", "key")
            .attr("transform", `translate(${this.elDimensions.width - 150},10)`)
        var texture = textures.lines()
            .size(6)
            .strokeWidth(1)
            .stroke("#fff")
            .orientation("6/8")
            .background(this.colour)
        this.svg.call(texture)
        this.key.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", texture.url())
        this.key.append("text")
            .text("Marginal seat")
            .attr("x", 20)
            .attr("y", 6)
    }

    renderHex() {
        var electorateMap = d3.map(this.data, (d) => d.key)
        this.hexFeatures = topojson.feature(hexagonsTopo, hexagonsTopo.objects.hexagons).features
        this.hexFeatures.forEach((h) => {
            var electorate = electorateMap.get(h.properties.electorate)
            h.data = electorate
        })
        this.hexGroup = this.map.append('g').attr('class', 'cartogram__hexgroup')
        this.hexPaths = this.hexGroup.selectAll("path")
            .data(this.hexFeatures)
        this.hexPaths
            .enter().append("path")
            .attr("d", this.path)
            .classed('cartogram__hex', true)
        this.render();
    }
    mapCoordsToScreenCoords(coords) {
        return [0,1].map(i => (coords[i] * this.scale[i]) + this.translate[i]);
    }
    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        return {width: width, height: width}
    }
    get elCenter() {
        var rect = this.elDimensions;
        return [rect.width/2, rect.height/2];
    }

    resize() {
        this.projection.translate([this.elDimensions.width / 2, this.elDimensions.height/2])
        this.path.projection(this.projection)
        this.renderHex(this.data)
        this.key.attr("transform", `translate(${this.elDimensions.width - 150},10)`)
        this.project()
    }

    render() {
        var self = this;

        // shared rendering
        var alternate = 0;
        this.hexPaths
            .attr('fill', (d) => {
                if (d.data) {
                    if (d.data.values[0].values[0].status === "Marginal") {
                        var texture = textures.lines()
                            .size(6)
                            .strokeWidth(1)
                            .stroke("#fff")
                            .orientation("6/8")
                            .background(this.colourScale(this.visitScale(d.data.values.length)) )
                        this.svg.call(texture)
                        return texture.url()
                    } else {
                        return this.colourScale(this.visitScale(d.data.values.length))
                    }
                } else {
                    return "#f6f6f6"
                }
            })
            .on("mouseover", function(d) { 
                if (d.data) {
                    self.renderTooltip(d, d.data.values[0].values[0].status, d.data.values)
                    d3.select(this).attr("stroke", "#333")
                        .attr("stroke-width", 2)
                        .moveToFront()
                }
            })
            .on("mouseout", function(d) { 
                self.hideTooltip()
                d3.select(this).attr("stroke", null)
                    .attr("stroke-width", 1)
                    .moveToFront()
            })
    }

    renderDateFilter(dateEnd) {
        var self = this

        // this.hexPaths.filter((d) => d.data && d.data.values[0].values[0].status === "Marginal")
        //     .attr("fill", "#f6f6f6")

        this.hexPaths
            .on("mouseover", function(d) { 
                if (d.data) {
                    var data = d.data.values.filter((d) => self.dateFormat.parse(d.key) <= dateEnd)

                    if (data.length > 0) {
                        self.renderTooltip(d, data[0].values[0].status, data)
                        d3.select(this).attr("stroke", "#333")
                            .attr("stroke-width", 2)
                            .moveToFront()
                    }
                }
            })
            // .transition()
            .attr('fill', (d) => {
                if (d.data) {
                    var data = d.data.values.filter((d) => this.dateFormat.parse(d.key) <= dateEnd)
                    if (data.length > 0) {

                        if (data[0].values[0].status === "Marginal") {
                            var texture = textures.lines()
                                .size(6)
                                .strokeWidth(1)
                                .stroke("#fff")
                                .orientation("6/8")
                                .background(this.colourScale(this.visitScale(data.length)) )
                            this.svg.call(texture)
                            return texture.url()
                        } else {
                            return this.colourScale(this.visitScale(data.length))
                        }
                    } else { return "#f6f6f6" }
                } else {
                    return "#f6f6f6"
                }
            })
    }

    renderTooltip(electorate, status, data) {
        if (!this.tooltip) {
            var tooltip = d3.select(this.el).append("div")
                .attr("class", "tooltip")
            this.tooltip = document.querySelector(`${this.el} .tooltip`)
        }
        var msg = `${electorate.properties.electorate}: ${data.length} visits <em>${status} seat</em>`

        this.tooltip.innerHTML =
            '<span class="tooltip__spout"></span>' +
            `<h4>${msg}</h4>`

        var rect = this.tooltip.getBoundingClientRect();
        var centroid = this.hexCentroids[electorate.properties.electorate];
        var coords = centroid
        this.tooltip.style.visibility = 'visible';

        var elDimensions = this.elDimensions;
        var topSide = coords[1] > (elDimensions.height / 2);
        this.tooltip.style.top = (topSide ? coords[1] - rect.height - 8 : coords[1] + rect.height/2 - 8) + 'px';
        var desiredLeft = (coords[0] - (rect.width / 2));
        var maxLeft = elDimensions.width - rect.width;
        var minLeft = 0;
        var actualLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));
        this.tooltip.style.left = actualLeft + 'px';

        var spoutOffset = Math.min(rect.width - 12, coords[0] - actualLeft);
        this.tooltip.querySelector('.tooltip__spout').style.left = spoutOffset + 'px';
        this.tooltip.className = 'tooltip' + (topSide ? ' tooltip--above' : ' tooltip--below');
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.style.visibility = 'hidden';
    }
}
