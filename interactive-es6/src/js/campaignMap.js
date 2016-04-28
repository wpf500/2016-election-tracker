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
        this.colours = {
            coalition: "#005689",
            labor: "#b51800"
        }
        var self = this;
        // this.initTextures()
        this.renderHex(data, maxVisits, colour)
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
        var scale = elDimensions.width
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


    renderHex(data, maxVisits, colour) {
        // this.dataByElectorate = d3.nest()
        //     .key((d) => d.electorate)
        //     .entries(data.values)
        var electorateMap = d3.map(data, (d) => d.key)
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
        this.render(data, maxVisits, colour);
    }
    mapCoordsToScreenCoords(coords) {
        console.log(coords)
        return [0,1].map(i => (coords[i] * this.scale[i]) + this.translate[i]);
    }
    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        return {width: width, height: width * 0.8}
    }
    get elCenter() {
        var rect = this.elDimensions;
        return [rect.width/2, rect.height/2];
    }

    render(data, maxVisits, colour) {
        var self = this;
        var visitScale = d3.scale.sqrt().domain([0, maxVisits])
        var colourScale = d3.interpolate("#fff", colour)

        // shared rendering
        var alternate = 0;
        this.hexPaths
            .attr('fill', (d) => {
                if (d.data) {
                    if (d.data.values[0].status === "Marginal") {
                        var texture = textures.lines()
                            .size(6)
                            .strokeWidth(1)
                            .stroke("#fff")
                            .orientation("6/8")
                            .background(colourScale(visitScale(d.data.values.length)) )
                        this.svg.call(texture)
                        return texture.url()
                    } else {
                        return colourScale(visitScale(d.data.values.length))
                    }
                } else {
                    return "#f6f6f6"
                }
            })
            .on("mouseover", function(d) { 
                if (d.data) {
                    self.renderTooltip(d)
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

    renderTooltip(electorate) {
        if (!this.tooltip) {
            var tooltip = d3.select(this.el).append("div")
                .attr("class", "tooltip")
            this.tooltip = document.querySelector(`${this.el} .tooltip`)
        }

        var msg = `${electorate.properties.electorate}: ${electorate.data.values.length} visits`

        this.tooltip.innerHTML =
            '<span class="tooltip__spout"></span>' +
            `<h4>${msg}</h4>`

        var rect = this.tooltip.getBoundingClientRect();
        var centroid = this.hexCentroids[electorate.properties.electorate];
        // var coords = this.mapCoordsToScreenCoords(centroid);
        var coords = centroid
        this.tooltip.style.visibility = 'visible';

        var elDimensions = this.elDimensions;
        var topSide = coords[1] > (elDimensions.height / 2);
        this.tooltip.style.top = (topSide ? coords[1] - rect.height/2 : coords[1] - rect.height/2) + 'px';
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
