import { datajs } from './data.js'

const global = {
    players: datajs
}
const width = 500
const height = 500
const arcposshift = 400

const all_players = global.players.filter(d => {
    return (d.ftPct > 0) && (d.fg3Pct < 100)
})

const radiusScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, width / 2]);


const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(all_players, d => d.ftmRank))
    .interpolator(d3.interpolateRdYlBu);

const arcGenerator = d3.arc();

function loadChart(all, sortOrder) {
    let teamId = document.getElementById('teamSelect').value;
    let players = all_players;
    if (!all) {
        players = all_players.filter(d => (d.teamId == teamId))
    }

    if (sortOrder == ' ftmRank') {
        players.sort(function (x, y) {
            return d3.ascending(x.ftmRank, y.ftmRank);
        })
    } else if (sortOrder == 'ftPct') {
        players.sort(function (x, y) {
            return d3.descending(x.ftPct, y.ftPct);
        })
    } else if (sortOrder == 'fg3Pct') {
        players.sort(function (x, y) {
            return d3.descending(x.fg3Pct, y.fg3Pct);
        })
    } else {
        players.sort(function (x, y) {
            return d3.ascending(x.ftmRank, y.ftmRank);
        })
    }
    let perSliceAngle = (2 * Math.PI) / players.length;
    let arcs = players.map((d, i) => {
        return {
            startAngle: i * perSliceAngle,
            endAngle: (i + 1) * perSliceAngle,
            finalStartAngle: i * perSliceAngle,
            finalEndAngle: (i + 1) * perSliceAngle,
            innerRadius: radiusScale(d.ftPct) + arcposshift,
            outerRadius: radiusScale(d.fg3Pct) + arcposshift,
            fill: colorScale(d.ftmRank),
            playerName: d.playerName,
            ftmRank: d.ftmRank,
            ftPct: Math.round(d.ftPct * 10) / 10,
            fg3Pct: Math.round(d.fg3Pct * 10) / 10
        }
    })

    let svg = d3.select('#nba-radial').append("svg")
        .attr("width", width)
        .attr("height", height + 20)
        .call(d3.zoom().on("zoom", function () {
            d3.select('.tooltip').style('opacity', 0)
            svg.attr("transform", d3.event.transform)
        }))
        .append("g")

    let barWrapper = svg
        .append("g").append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


    //draw bars
    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    barWrapper.selectAll(".pctBar")
        .data(arcs)
        .enter().append("path")
        .attr("class", "pctBar")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => (d.fill))
        .attr("y", 200)
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.playerName + '<br/>' + ' FTM Rank: ' + d.ftmRank + '<br/>' + ' FTP: ' + d.ftPct + '<br/>' + ' FG3P: ' + d.fg3Pct)
                // .style("left", 0+"px")
                // .style("top", 0 + "px");
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })

    //Draw gridlines below the bars
    let axes = barWrapper.selectAll(".gridCircles")
        .data([20, 40, 60, 80, 100])
        .enter().append("g");
    //Draw the circles
    axes.append("circle")
        .attr("class", "axisCircles")
        .attr("r", function (d, i) {
            return radiusScale(d);
        });
    // //Draw the axis labels
    axes.append("text")
        .attr("class", "axisText")
        .attr("y", function (d) { return radiusScale(d); })
        .attr("dy", "0.3em")
        .text(function (d) { return d + "%" });

    svg.selectAll("path").transition()
        .delay(function (d, i) { return (all ? 2 : 50) * i; })
        .duration(500)
        .attrTween("d", function (d) { return arcTween(d) })

}

function nbaChartChange(checked, isCbox) {
    d3.selectAll("path").transition()
        .delay(function (d, i) { return ((checked) ? 2 : 50) * i; })
        .duration(500)
        .attrTween("d", function (d) { return arcTweenReverse(d) })
    d3.select("svg").transition()
        .duration(checked ? 1200 : 1000)
        .remove()
        .on("end", () => loadChart((isCbox ? !checked : checked), sortSelect.value));
}

function arcTween(d) {
    let newInnerRadius = d.innerRadius - arcposshift;
    let newOuterRadius = d.outerRadius - arcposshift;
    let interpolate_start = d3.interpolate(d.innerRadius, newInnerRadius)
    let interpolate_end = d3.interpolate(d.outerRadius, newOuterRadius)
    return function (t) {
        d.innerRadius = interpolate_start(t)
        d.outerRadius = interpolate_end(t)
        return arcGenerator(d)
    }
}

function arcTweenReverse(d) {
    const arcGenerator = d3.arc();
    let newInnerRadius = d.innerRadius + arcposshift;
    let newOuterRadius = d.outerRadius + arcposshift;
    let interpolate_start = d3.interpolate(d.innerRadius, newInnerRadius)
    let interpolate_end = d3.interpolate(d.outerRadius, newOuterRadius)
    return function (t) {
        d.innerRadius = interpolate_start(t)
        d.outerRadius = interpolate_end(t)
        return arcGenerator(d)
    }
}


export { loadChart, nbaChartChange, arcTweenReverse };