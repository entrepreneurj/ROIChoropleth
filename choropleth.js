var data; // loaded asynchronously

//Albers projection values based on playing with ireland.json using D3's Albers Example
var proj = d3.geoConicConformal()
          //.center([-7.9,53.3])
          .scale(6000)
          .translate([850,6100]);
var path = d3.geoPath().projection(proj);
var formatHectares = d3.format("0.2s");
var width = 900, height = 500;

var svg = d3.select("#chart")
  .append("svg");

var counties = svg.append("g")
    .attr("id", "ireland");

//Irish geoJSON based on https://gist.github.com/2183412
d3.json("ireland.json", function(json) {
  counties.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("class", "ireland")
      //.attr("fill","green")
      .attr("d", path);
});

// return quantize thresholds for the key
var qrange = function(max, num) {
    var a = [];
    for (var i=0; i<=num; i++) {
        a.push(i*max/num);
    }
    return a;
}

d3.json("road-deaths-2010.json", function(json) {
  data = json;
  var max = Math.max(...Object.values(data))
  var min = Math.min(...Object.values(data))
  var quantize = d3.scaleQuantize()
    .domain([0, max])
    .range(["#001100", "#003300", "#005500", "#007700", "#009900", "#00bb00", "#00dd00", "#00ee00", "#00ff00"]);

  counties.selectAll("path")
      .attr("fill", function(d) {return quantize(data[d.properties.id])})
      //.attr("class", quantize);

      var x = d3.scaleLinear()
        .domain([0, max])
        .range([0, height/2]);

      var xAxis = d3.axisLeft()
        .scale(x)
        //.orient("bottom")
        .tickSize(14)
        .tickValues(qrange(quantize.domain()[1], quantize.range().length))
        .tickFormat(function(d) { return formatHectares(d); })
        //.attr("height",10);
      var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate( 50," + height * 0 / 4 + 50 + ")");

      g.selectAll("rect")
        .data(quantize.range().map(function(color) {
          var d = quantize.invertExtent(color);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", function(d) { return x(d[1]) - x(d[0]); })
        .attr("y", function(d) { return x(d[0]); })
        .attr("width", function(d) { return (x(d[1]) - x(d[0]))/2; })
        .style("fill", function(d) { return quantize(d[0]); });

      g.call(xAxis).append("text")
        .attr("class", "caption")
        .attr("y", -10)
        .attr("x",110)
        .text("Household owner occupancy rate")
        .attr("fill", "black");
});

/*function quantize(d) {}
  return "q" + Math.min(8, ~~(data[d.properties.id] * 9 / 21)) + "-9";
}*/
