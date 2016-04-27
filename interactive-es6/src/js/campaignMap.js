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
    constructor(el, data, colour) {
        this.el = el;
        this.svg = d3.select(el).append("svg");
        this.map = this.svg.append('g');
        var self = this;
        this.renderHex(data, colour)
        this.project()

    }

    project() { // do projections separately so we can rerender
        var self = this;
        this.initProjection();
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

    renderHex(data, colour) {
        this.hexFeatures = topojson.feature(hexagonsTopo, hexagonsTopo.objects.hexagons).features
        this.hexGroup = this.map.append('g').attr('class', 'cartogram__hexgroup')
        this.hexPaths = this.hexGroup.selectAll("path")
            .data(this.hexFeatures)
        this.hexPaths
            .enter().append("path")
            .attr("d", this.path)
            .classed('cartogram__hex', true)
        this.render(data, colour);
    }

    get elDimensions() { 
        var width = document.querySelector(this.el).getBoundingClientRect().width
        return {width: width, height: width * 0.8}
    }
    get elCenter() {
        var rect = this.elDimensions;
        return [rect.width/2, rect.height/2];
    }

    render(data, colour) {
        var self = this;
        var dataByElectorate = d3.nest()
            .key((d) => d.electorate)
            .entries(data.values)
        var electorateMap = d3.map(dataByElectorate, (d) => d.key)
        var maxVisits = d3.max(dataByElectorate, (d) => d.values.length)
        var visitScale = d3.scale.sqrt().domain([0, maxVisits])
        var colourScale = d3.interpolate("#fff", colour)

        console.log(maxVisits)
        // shared rendering
        var alternate = 0;
        this.hexPaths
            .attr('fill', (d) => {
                var electorate = electorateMap.get(d.properties.electorate)
                if (electorate) {
                    return colourScale(visitScale(electorate.values.length))               
                } else {
                    return "#fff"
                }
            })
            .attr('stroke-width', (d) => {
                var electorate = electorateMap.get(d.properties.electorate)
                if (electorate && electorate.status === "Marginal") {
                    return 2
                } else {
                    return 1
                }
            })
            .attr('stroke', (d) => {
                var electorate = electorateMap.get(d.properties.electorate)
                if (electorate && electorate.status === "Marginal") {
                    return "#333"
                } else {
                    return null
                }
            })
    }
}
