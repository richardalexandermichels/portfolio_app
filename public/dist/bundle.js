(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.arcTweenReverse = exports.nbaChartChange = exports.loadChart = undefined;

var _data = require('./data.js');

var global = {
    players: _data.datajs
};
var width = 500;
var height = 500;
var arcposshift = 400;

var all_players = global.players.filter(function (d) {
    return d.ftPct > 0 && d.fg3Pct < 100;
});

var radiusScale = d3.scaleLinear().domain([0, 100]).range([0, width / 2]);

var colorScale = d3.scaleSequential().domain(d3.extent(all_players, function (d) {
    return d.ftmRank;
})).interpolator(d3.interpolateRdYlBu);

var arcGenerator = d3.arc();

function loadChart(all, sortOrder) {
    var teamId = document.getElementById('teamSelect').value;
    var players = all_players;
    if (!all) {
        players = all_players.filter(function (d) {
            return d.teamId == teamId;
        });
    }

    if (sortOrder == ' ftmRank') {
        players.sort(function (x, y) {
            return d3.ascending(x.ftmRank, y.ftmRank);
        });
    } else if (sortOrder == 'ftPct') {
        players.sort(function (x, y) {
            return d3.descending(x.ftPct, y.ftPct);
        });
    } else if (sortOrder == 'fg3Pct') {
        players.sort(function (x, y) {
            return d3.descending(x.fg3Pct, y.fg3Pct);
        });
    } else {
        players.sort(function (x, y) {
            return d3.ascending(x.ftmRank, y.ftmRank);
        });
    }
    var perSliceAngle = 2 * Math.PI / players.length;
    var arcs = players.map(function (d, i) {
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
        };
    });

    var svg = d3.select('#nba-radial').append("svg").attr("width", width).attr("height", height + 20).call(d3.zoom().on("zoom", function () {
        d3.select('.tooltip').style('opacity', 0);
        svg.attr("transform", d3.event.transform);
    })).append("g");

    var barWrapper = svg.append("g").append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //draw bars
    var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    barWrapper.selectAll(".pctBar").data(arcs).enter().append("path").attr("class", "pctBar").attr("d", arcGenerator).attr("fill", function (d, i) {
        return d.fill;
    }).attr("y", 200).on("mouseover", function (d) {
        div.transition().duration(200).style("opacity", .9);
        div.html(d.playerName + '<br/>' + ' FTM Rank: ' + d.ftmRank + '<br/>' + ' FTP: ' + d.ftPct + '<br/>' + ' FG3P: ' + d.fg3Pct)
        // .style("left", 0+"px")
        // .style("top", 0 + "px");
        .style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
    }).on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
    });

    //Draw gridlines below the bars
    var axes = barWrapper.selectAll(".gridCircles").data([20, 40, 60, 80, 100]).enter().append("g");
    //Draw the circles
    axes.append("circle").attr("class", "axisCircles").attr("r", function (d, i) {
        return radiusScale(d);
    });
    // //Draw the axis labels
    axes.append("text").attr("class", "axisText").attr("y", function (d) {
        return radiusScale(d);
    }).attr("dy", "0.3em").text(function (d) {
        return d + "%";
    });

    svg.selectAll("path").transition().delay(function (d, i) {
        return (all ? 2 : 50) * i;
    }).duration(500).attrTween("d", function (d) {
        return arcTween(d);
    });
}

function nbaChartChange(checked, isCbox) {
    d3.selectAll("path").transition().delay(function (d, i) {
        return (checked ? 2 : 50) * i;
    }).duration(500).attrTween("d", function (d) {
        return arcTweenReverse(d);
    });
    d3.select("svg").transition().duration(checked ? 1200 : 1000).remove().on("end", function () {
        return loadChart(isCbox ? !checked : checked, sortSelect.value);
    });
}

function arcTween(d) {
    var newInnerRadius = d.innerRadius - arcposshift;
    var newOuterRadius = d.outerRadius - arcposshift;
    var interpolate_start = d3.interpolate(d.innerRadius, newInnerRadius);
    var interpolate_end = d3.interpolate(d.outerRadius, newOuterRadius);
    return function (t) {
        d.innerRadius = interpolate_start(t);
        d.outerRadius = interpolate_end(t);
        return arcGenerator(d);
    };
}

function arcTweenReverse(d) {
    var arcGenerator = d3.arc();
    var newInnerRadius = d.innerRadius + arcposshift;
    var newOuterRadius = d.outerRadius + arcposshift;
    var interpolate_start = d3.interpolate(d.innerRadius, newInnerRadius);
    var interpolate_end = d3.interpolate(d.outerRadius, newOuterRadius);
    return function (t) {
        d.innerRadius = interpolate_start(t);
        d.outerRadius = interpolate_end(t);
        return arcGenerator(d);
    };
}

exports.loadChart = loadChart;
exports.nbaChartChange = nbaChartChange;
exports.arcTweenReverse = arcTweenReverse;

},{"./data.js":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var datajs = [{ "playerName": "Aaron Gordon", "ftmRank": 83, "ftPct": 73.1, "fg3Pct": 34.9, "teamId": 1610612753 }, { "playerName": "Aaron Holiday", "ftmRank": 304, "ftPct": 82, "fg3Pct": 33.900000000000006, "teamId": 1610612754 }, { "playerName": "Abdel Nader", "ftmRank": 410, "ftPct": 75, "fg3Pct": 32, "teamId": 1610612760 }, { "playerName": "Al Horford", "ftmRank": 220, "ftPct": 82.1, "fg3Pct": 36, "teamId": 1610612738 }, { "playerName": "Al-Farouq Aminu", "ftmRank": 131, "ftPct": 86.7, "fg3Pct": 34.300000000000004, "teamId": 1610612757 }, { "playerName": "Alan Williams", "ftmRank": 422, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612751 }, { "playerName": "Alec Burks", "ftmRank": 136, "ftPct": 82.3, "fg3Pct": 36.3, "teamId": 1610612758 }, { "playerName": "Alex Abrines", "ftmRank": 426, "ftPct": 92.30000000000001, "fg3Pct": 32.300000000000004, "teamId": 1610612760 }, { "playerName": "Alex Caruso", "ftmRank": 105, "ftPct": 79.7, "fg3Pct": 48, "teamId": 1610612747 }, { "playerName": "Alex Len", "ftmRank": 135, "ftPct": 64.8, "fg3Pct": 36.3, "teamId": 1610612737 }, { "playerName": "Alex Poythress", "ftmRank": 290, "ftPct": 62.1, "fg3Pct": 39.1, "teamId": 1610612737 }, { "playerName": "Alfonzo McKinnie", "ftmRank": 430, "ftPct": 56.3, "fg3Pct": 35.6, "teamId": 1610612744 }, { "playerName": "Alize Johnson", "ftmRank": 454, "ftPct": 50, "fg3Pct": 50, "teamId": 1610612754 }, { "playerName": "Allen Crabbe", "ftmRank": 268, "ftPct": 73.2, "fg3Pct": 37.8, "teamId": 1610612751 }, { "playerName": "Allonzo Trier", "ftmRank": 62, "ftPct": 80.30000000000001, "fg3Pct": 39.4, "teamId": 1610612752 }, { "playerName": "Amile Jefferson", "ftmRank": 371, "ftPct": 87.5, "fg3Pct": 0, "teamId": 1610612753 }, { "playerName": "Amir Johnson", "ftmRank": 365, "ftPct": 75.6, "fg3Pct": 30, "teamId": 1610612755 }, { "playerName": "Andre Drummond", "ftmRank": 47, "ftPct": 59, "fg3Pct": 13.200000000000001, "teamId": 1610612765 }, { "playerName": "Andre Iguodala", "ftmRank": 374, "ftPct": 58.199999999999996, "fg3Pct": 33.300000000000004, "teamId": 1610612744 }, { "playerName": "Andre Ingram", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612747 }, { "playerName": "Andrew Bogut", "ftmRank": 464, "ftPct": 100, "fg3Pct": 0, "teamId": 1610612744 }, { "playerName": "Andrew Harrison", "ftmRank": 249, "ftPct": 94.39999999999999, "fg3Pct": 20, "teamId": 1610612740 }, { "playerName": "Andrew Wiggins", "ftmRank": 59, "ftPct": 69.89999999999999, "fg3Pct": 33.900000000000006, "teamId": 1610612750 }, { "playerName": "Anfernee Simons", "ftmRank": 407, "ftPct": 56.3, "fg3Pct": 34.5, "teamId": 1610612757 }, { "playerName": "Angel Delgado", "ftmRank": 388, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612746 }, { "playerName": "Ante Zizic", "ftmRank": 163, "ftPct": 70.5, "fg3Pct": 0, "teamId": 1610612739 }, { "playerName": "Anthony Davis", "ftmRank": 4, "ftPct": 79.4, "fg3Pct": 33.1, "teamId": 1610612740 }, { "playerName": "Anthony Tolliver", "ftmRank": 333, "ftPct": 78.3, "fg3Pct": 37.7, "teamId": 1610612750 }, { "playerName": "Antonio Blakeney", "ftmRank": 285, "ftPct": 65.8, "fg3Pct": 39.6, "teamId": 1610612741 }, { "playerName": "Aron Baynes", "ftmRank": 241, "ftPct": 85.5, "fg3Pct": 34.4, "teamId": 1610612738 }, { "playerName": "Austin Rivers", "ftmRank": 354, "ftPct": 52.6, "fg3Pct": 31.8, "teamId": 1610612745 }, { "playerName": "Avery Bradley", "ftmRank": 347, "ftPct": 86, "fg3Pct": 35.099999999999994, "teamId": 1610612763 }, { "playerName": "BJ Johnson", "ftmRank": 454, "ftPct": 100, "fg3Pct": 42.9, "teamId": 1610612758 }, { "playerName": "Bam Adebayo", "ftmRank": 107, "ftPct": 73.5, "fg3Pct": 20, "teamId": 1610612748 }, { "playerName": "Ben McLemore", "ftmRank": 416, "ftPct": 66.7, "fg3Pct": 41.5, "teamId": 1610612758 }, { "playerName": "Ben Simmons", "ftmRank": 41, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612755 }, { "playerName": "Billy Garrett", "ftmRank": 249, "ftPct": 100, "fg3Pct": 0, "teamId": 1610612752 }, { "playerName": "Bismack Biyombo", "ftmRank": 233, "ftPct": 63.7, "fg3Pct": 0, "teamId": 1610612766 }, { "playerName": "Blake Griffin", "ftmRank": 11, "ftPct": 75.3, "fg3Pct": 36.199999999999996, "teamId": 1610612765 }, { "playerName": "Boban Marjanovic", "ftmRank": 149, "ftPct": 74.8, "fg3Pct": 40, "teamId": 1610612755 }, { "playerName": "Bobby Portis", "ftmRank": 165, "ftPct": 79.4, "fg3Pct": 39.300000000000004, "teamId": 1610612764 }, { "playerName": "Bogdan Bogdanovic", "ftmRank": 121, "ftPct": 82.69999999999999, "fg3Pct": 36, "teamId": 1610612758 }, { "playerName": "Bojan Bogdanovic", "ftmRank": 48, "ftPct": 80.7, "fg3Pct": 42.5, "teamId": 1610612754 }, { "playerName": "Bonzie Colson", "ftmRank": 249, "ftPct": 88.9, "fg3Pct": 23.799999999999997, "teamId": 1610612749 }, { "playerName": "Brad Wanamaker", "ftmRank": 349, "ftPct": 85.7, "fg3Pct": 41, "teamId": 1610612738 }, { "playerName": "Bradley Beal", "ftmRank": 23, "ftPct": 80.80000000000001, "fg3Pct": 35.099999999999994, "teamId": 1610612764 }, { "playerName": "Brandon Goodwin", "ftmRank": 375, "ftPct": 81.8, "fg3Pct": 33.300000000000004, "teamId": 1610612743 }, { "playerName": "Brandon Ingram", "ftmRank": 34, "ftPct": 67.5, "fg3Pct": 33, "teamId": 1610612747 }, { "playerName": "Brandon Knight", "ftmRank": 345, "ftPct": 79.4, "fg3Pct": 31.8, "teamId": 1610612739 }, { "playerName": "Brandon Sampson", "ftmRank": 454, "ftPct": 66.7, "fg3Pct": 37.9, "teamId": 1610612741 }, { "playerName": "Brook Lopez", "ftmRank": 185, "ftPct": 84.2, "fg3Pct": 36.5, "teamId": 1610612749 }, { "playerName": "Bruce Brown", "ftmRank": 364, "ftPct": 75, "fg3Pct": 25.8, "teamId": 1610612765 }, { "playerName": "Bruno Caboclo", "ftmRank": 197, "ftPct": 84, "fg3Pct": 36.9, "teamId": 1610612763 }, { "playerName": "Bryn Forbes", "ftmRank": 297, "ftPct": 88.5, "fg3Pct": 42.6, "teamId": 1610612759 }, { "playerName": "Buddy Hield", "ftmRank": 101, "ftPct": 88.6, "fg3Pct": 42.699999999999996, "teamId": 1610612758 }, { "playerName": "C.J. Williams", "ftmRank": 497, "ftPct": 0, "fg3Pct": 31.3, "teamId": 1610612750 }, { "playerName": "CJ McCollum", "ftmRank": 90, "ftPct": 82.8, "fg3Pct": 37.5, "teamId": 1610612757 }, { "playerName": "CJ Miles", "ftmRank": 277, "ftPct": 82.8, "fg3Pct": 33, "teamId": 1610612763 }, { "playerName": "Caleb Swanigan", "ftmRank": 454, "ftPct": 66.7, "fg3Pct": 14.299999999999999, "teamId": 1610612758 }, { "playerName": "Cameron Payne", "ftmRank": 302, "ftPct": 80.5, "fg3Pct": 29.799999999999997, "teamId": 1610612739 }, { "playerName": "Cameron Reynolds", "ftmRank": 416, "ftPct": 88.9, "fg3Pct": 41.199999999999996, "teamId": 1610612750 }, { "playerName": "Caris LeVert", "ftmRank": 100, "ftPct": 69.1, "fg3Pct": 31.2, "teamId": 1610612751 }, { "playerName": "Carmelo Anthony", "ftmRank": 168, "ftPct": 68.2, "fg3Pct": 32.800000000000004, "teamId": 1610612745 }, { "playerName": "Cedi Osman", "ftmRank": 130, "ftPct": 77.9, "fg3Pct": 34.8, "teamId": 1610612739 }, { "playerName": "Chandler Hutchison", "ftmRank": 385, "ftPct": 60.5, "fg3Pct": 28.000000000000004, "teamId": 1610612741 }, { "playerName": "Chandler Parsons", "ftmRank": 282, "ftPct": 88, "fg3Pct": 30.9, "teamId": 1610612763 }, { "playerName": "Channing Frye", "ftmRank": 449, "ftPct": 78.60000000000001, "fg3Pct": 40.5, "teamId": 1610612739 }, { "playerName": "Chasson Randle", "ftmRank": 284, "ftPct": 69.39999999999999, "fg3Pct": 40, "teamId": 1610612764 }, { "playerName": "Cheick Diallo", "ftmRank": 317, "ftPct": 74.6, "fg3Pct": 25, "teamId": 1610612740 }, { "playerName": "Chimezie Metu", "ftmRank": 408, "ftPct": 76.5, "fg3Pct": 0, "teamId": 1610612759 }, { "playerName": "Chris Boucher", "ftmRank": 405, "ftPct": 86.7, "fg3Pct": 32.4, "teamId": 1610612761 }, { "playerName": "Chris Chiozza", "ftmRank": 497, "ftPct": 0, "fg3Pct": 40, "teamId": 1610612745 }, { "playerName": "Chris Paul", "ftmRank": 49, "ftPct": 86.2, "fg3Pct": 35.8, "teamId": 1610612745 }, { "playerName": "Christian Wood", "ftmRank": 117, "ftPct": 73.2, "fg3Pct": 34.599999999999994, "teamId": 1610612740 }, { "playerName": "Clint Capela", "ftmRank": 75, "ftPct": 63.6, "fg3Pct": 0, "teamId": 1610612745 }, { "playerName": "Cody Zeller", "ftmRank": 92, "ftPct": 78.7, "fg3Pct": 27.3, "teamId": 1610612766 }, { "playerName": "Collin Sexton", "ftmRank": 69, "ftPct": 83.89999999999999, "fg3Pct": 40.2, "teamId": 1610612739 }, { "playerName": "Corey Brewer", "ftmRank": 249, "ftPct": 72.1, "fg3Pct": 31.8, "teamId": 1610612758 }, { "playerName": "Cory Joseph", "ftmRank": 434, "ftPct": 69.8, "fg3Pct": 32.2, "teamId": 1610612754 }, { "playerName": "Courtney Lee", "ftmRank": 419, "ftPct": 66.7, "fg3Pct": 29.099999999999998, "teamId": 1610612742 }, { "playerName": "Cristiano Felicio", "ftmRank": 300, "ftPct": 68.5, "fg3Pct": 0, "teamId": 1610612741 }, { "playerName": "D'Angelo Russell", "ftmRank": 115, "ftPct": 78, "fg3Pct": 36.9, "teamId": 1610612751 }, { "playerName": "D.J. Augustin", "ftmRank": 94, "ftPct": 86.6, "fg3Pct": 42.1, "teamId": 1610612753 }, { "playerName": "D.J. Wilson", "ftmRank": 381, "ftPct": 55.300000000000004, "fg3Pct": 36.199999999999996, "teamId": 1610612749 }, { "playerName": "DJ Stephens", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612763 }, { "playerName": "Dairis Bertans", "ftmRank": 497, "ftPct": 0, "fg3Pct": 29.4, "teamId": 1610612740 }, { "playerName": "Damian Jones", "ftmRank": 249, "ftPct": 64.9, "fg3Pct": 0, "teamId": 1610612744 }, { "playerName": "Damian Lillard", "ftmRank": 8, "ftPct": 91.2, "fg3Pct": 36.9, "teamId": 1610612757 }, { "playerName": "Damion Lee", "ftmRank": 369, "ftPct": 86.4, "fg3Pct": 39.7, "teamId": 1610612744 }, { "playerName": "Damyean Dotson", "ftmRank": 249, "ftPct": 74.5, "fg3Pct": 36.8, "teamId": 1610612752 }, { "playerName": "Daniel Hamilton", "ftmRank": 488, "ftPct": 50, "fg3Pct": 34.8, "teamId": 1610612737 }, { "playerName": "Daniel Theis", "ftmRank": 295, "ftPct": 73.7, "fg3Pct": 38.800000000000004, "teamId": 1610612738 }, { "playerName": "Danilo Gallinari", "ftmRank": 12, "ftPct": 90.4, "fg3Pct": 43.3, "teamId": 1610612746 }, { "playerName": "Danny Green", "ftmRank": 406, "ftPct": 84.1, "fg3Pct": 45.5, "teamId": 1610612761 }, { "playerName": "Dante Cunningham", "ftmRank": 475, "ftPct": 77.8, "fg3Pct": 46.2, "teamId": 1610612759 }, { "playerName": "Dante Exum", "ftmRank": 159, "ftPct": 79.10000000000001, "fg3Pct": 28.999999999999996, "teamId": 1610612762 }, { "playerName": "Danuel House Jr.", "ftmRank": 178, "ftPct": 78.9, "fg3Pct": 41.6, "teamId": 1610612745 }, { "playerName": "Dario Saric", "ftmRank": 157, "ftPct": 88, "fg3Pct": 36.5, "teamId": 1610612750 }, { "playerName": "Darius Miller", "ftmRank": 308, "ftPct": 78.9, "fg3Pct": 36.5, "teamId": 1610612740 }, { "playerName": "Darren Collison", "ftmRank": 102, "ftPct": 83.2, "fg3Pct": 40.699999999999996, "teamId": 1610612754 }, { "playerName": "Daryl Macon", "ftmRank": 388, "ftPct": 57.099999999999994, "fg3Pct": 45.5, "teamId": 1610612742 }, { "playerName": "David Nwaba", "ftmRank": 223, "ftPct": 68.2, "fg3Pct": 32, "teamId": 1610612739 }, { "playerName": "Davis Bertans", "ftmRank": 341, "ftPct": 88.3, "fg3Pct": 42.9, "teamId": 1610612759 }, { "playerName": "Davon Reed", "ftmRank": 497, "ftPct": 0, "fg3Pct": 50, "teamId": 1610612754 }, { "playerName": "De'Aaron Fox", "ftmRank": 35, "ftPct": 72.7, "fg3Pct": 37.1, "teamId": 1610612758 }, { "playerName": "De'Anthony Melton", "ftmRank": 418, "ftPct": 75, "fg3Pct": 30.5, "teamId": 1610612756 }, { "playerName": "DeAndre Jordan", "ftmRank": 66, "ftPct": 70.5, "fg3Pct": 0, "teamId": 1610612752 }, { "playerName": "DeAndre' Bembry", "ftmRank": 237, "ftPct": 64, "fg3Pct": 28.9, "teamId": 1610612737 }, { "playerName": "DeMar DeRozan", "ftmRank": 20, "ftPct": 83, "fg3Pct": 15.6, "teamId": 1610612759 }, { "playerName": "DeMarcus Cousins", "ftmRank": 38, "ftPct": 73.6, "fg3Pct": 27.400000000000002, "teamId": 1610612744 }, { "playerName": "DeMarre Carroll", "ftmRank": 63, "ftPct": 76, "fg3Pct": 34.2, "teamId": 1610612751 }, { "playerName": "DeVaughn Akoon-Purcell", "ftmRank": 489, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612743 }, { "playerName": "Deandre Ayton", "ftmRank": 114, "ftPct": 74.6, "fg3Pct": 0, "teamId": 1610612756 }, { "playerName": "Delon Wright", "ftmRank": 161, "ftPct": 79.3, "fg3Pct": 29.799999999999997, "teamId": 1610612763 }, { "playerName": "Demetrius Jackson", "ftmRank": 349, "ftPct": 100, "fg3Pct": 33.300000000000004, "teamId": 1610612755 }, { "playerName": "Deng Adel", "ftmRank": 478, "ftPct": 100, "fg3Pct": 26.1, "teamId": 1610612739 }, { "playerName": "Dennis Schroder", "ftmRank": 84, "ftPct": 81.89999999999999, "fg3Pct": 34.1, "teamId": 1610612760 }, { "playerName": "Dennis Smith Jr.", "ftmRank": 128, "ftPct": 63.5, "fg3Pct": 32.2, "teamId": 1610612752 }, { "playerName": "Deonte Burton", "ftmRank": 470, "ftPct": 66.7, "fg3Pct": 29.599999999999998, "teamId": 1610612760 }, { "playerName": "Derrick Favors", "ftmRank": 106, "ftPct": 67.5, "fg3Pct": 21.8, "teamId": 1610612762 }, { "playerName": "Derrick Jones Jr.", "ftmRank": 201, "ftPct": 60.699999999999996, "fg3Pct": 30.8, "teamId": 1610612748 }, { "playerName": "Derrick Rose", "ftmRank": 67, "ftPct": 85.6, "fg3Pct": 37, "teamId": 1610612750 }, { "playerName": "Derrick White", "ftmRank": 181, "ftPct": 77.2, "fg3Pct": 33.800000000000004, "teamId": 1610612759 }, { "playerName": "Devin Booker", "ftmRank": 5, "ftPct": 86.6, "fg3Pct": 32.6, "teamId": 1610612756 }, { "playerName": "Devin Harris", "ftmRank": 168, "ftPct": 76.1, "fg3Pct": 31, "teamId": 1610612742 }, { "playerName": "Devin Robinson", "ftmRank": 193, "ftPct": 64.3, "fg3Pct": 0, "teamId": 1610612764 }, { "playerName": "Devonte' Graham", "ftmRank": 321, "ftPct": 76.1, "fg3Pct": 28.1, "teamId": 1610612766 }, { "playerName": "Dewayne Dedmon", "ftmRank": 177, "ftPct": 81.39999999999999, "fg3Pct": 38.2, "teamId": 1610612737 }, { "playerName": "Deyonta Davis", "ftmRank": 349, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612737 }, { "playerName": "Dillon Brooks", "ftmRank": 207, "ftPct": 73.3, "fg3Pct": 37.5, "teamId": 1610612763 }, { "playerName": "Dion Waiters", "ftmRank": 388, "ftPct": 50, "fg3Pct": 37.7, "teamId": 1610612748 }, { "playerName": "Dirk Nowitzki", "ftmRank": 320, "ftPct": 78, "fg3Pct": 31.2, "teamId": 1610612742 }, { "playerName": "Domantas Sabonis", "ftmRank": 60, "ftPct": 71.5, "fg3Pct": 52.900000000000006, "teamId": 1610612754 }, { "playerName": "Donatas Motiejunas", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612759 }, { "playerName": "Donovan Mitchell", "ftmRank": 28, "ftPct": 80.60000000000001, "fg3Pct": 36.199999999999996, "teamId": 1610612762 }, { "playerName": "Donte DiVincenzo", "ftmRank": 444, "ftPct": 75, "fg3Pct": 26.5, "teamId": 1610612749 }, { "playerName": "Donte Grantham", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612760 }, { "playerName": "Dorian Finney-Smith", "ftmRank": 278, "ftPct": 70.89999999999999, "fg3Pct": 31.1, "teamId": 1610612742 }, { "playerName": "Doug McDermott", "ftmRank": 290, "ftPct": 83.5, "fg3Pct": 40.8, "teamId": 1610612754 }, { "playerName": "Dragan Bender", "ftmRank": 342, "ftPct": 59.3, "fg3Pct": 21.8, "teamId": 1610612756 }, { "playerName": "Draymond Green", "ftmRank": 267, "ftPct": 69.19999999999999, "fg3Pct": 28.499999999999996, "teamId": 1610612744 }, { "playerName": "Drew Eubanks", "ftmRank": 400, "ftPct": 84.6, "fg3Pct": 0, "teamId": 1610612759 }, { "playerName": "Duncan Robinson", "ftmRank": 467, "ftPct": 66.7, "fg3Pct": 28.599999999999998, "teamId": 1610612748 }, { "playerName": "Dusty Hannahs", "ftmRank": 249, "ftPct": 100, "fg3Pct": 0, "teamId": 1610612763 }, { "playerName": "Dwayne Bacon", "ftmRank": 314, "ftPct": 73.9, "fg3Pct": 43.7, "teamId": 1610612766 }, { "playerName": "Dwight Howard", "ftmRank": 44, "ftPct": 60.4, "fg3Pct": 0, "teamId": 1610612764 }, { "playerName": "Dwight Powell", "ftmRank": 72, "ftPct": 77.2, "fg3Pct": 30.7, "teamId": 1610612742 }, { "playerName": "Dwyane Wade", "ftmRank": 88, "ftPct": 70.8, "fg3Pct": 33, "teamId": 1610612748 }, { "playerName": "Dzanan Musa", "ftmRank": 497, "ftPct": 0, "fg3Pct": 10, "teamId": 1610612751 }, { "playerName": "E'Twaun Moore", "ftmRank": 294, "ftPct": 76.3, "fg3Pct": 43.2, "teamId": 1610612740 }, { "playerName": "Ed Davis", "ftmRank": 200, "ftPct": 61.7, "fg3Pct": 0, "teamId": 1610612751 }, { "playerName": "Edmond Sumner", "ftmRank": 356, "ftPct": 62.5, "fg3Pct": 25.900000000000002, "teamId": 1610612754 }, { "playerName": "Ekpe Udoh", "ftmRank": 431, "ftPct": 63.3, "fg3Pct": 0, "teamId": 1610612762 }, { "playerName": "Elfrid Payton", "ftmRank": 190, "ftPct": 74.3, "fg3Pct": 31.4, "teamId": 1610612740 }, { "playerName": "Elie Okobo", "ftmRank": 340, "ftPct": 78.7, "fg3Pct": 29.5, "teamId": 1610612756 }, { "playerName": "Emanuel Terry", "ftmRank": 349, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612748 }, { "playerName": "Emmanuel Mudiay", "ftmRank": 79, "ftPct": 77.4, "fg3Pct": 32.9, "teamId": 1610612752 }, { "playerName": "Enes Kanter", "ftmRank": 87, "ftPct": 78.7, "fg3Pct": 29.4, "teamId": 1610612757 }, { "playerName": "Eric Bledsoe", "ftmRank": 91, "ftPct": 75, "fg3Pct": 32.9, "teamId": 1610612749 }, { "playerName": "Eric Gordon", "ftmRank": 141, "ftPct": 78.3, "fg3Pct": 36, "teamId": 1610612745 }, { "playerName": "Eric Moreland", "ftmRank": 497, "ftPct": 0, "fg3Pct": 100, "teamId": 1610612761 }, { "playerName": "Ersan Ilyasova", "ftmRank": 274, "ftPct": 82.39999999999999, "fg3Pct": 36.3, "teamId": 1610612749 }, { "playerName": "Evan Fournier", "ftmRank": 148, "ftPct": 80.60000000000001, "fg3Pct": 34, "teamId": 1610612753 }, { "playerName": "Evan Turner", "ftmRank": 244, "ftPct": 70.8, "fg3Pct": 21.2, "teamId": 1610612757 }, { "playerName": "Frank Jackson", "ftmRank": 281, "ftPct": 74, "fg3Pct": 31.4, "teamId": 1610612740 }, { "playerName": "Frank Kaminsky", "ftmRank": 150, "ftPct": 73.8, "fg3Pct": 36, "teamId": 1610612766 }, { "playerName": "Frank Mason", "ftmRank": 246, "ftPct": 68.4, "fg3Pct": 21.9, "teamId": 1610612758 }, { "playerName": "Frank Ntilikina", "ftmRank": 384, "ftPct": 76.7, "fg3Pct": 28.7, "teamId": 1610612752 }, { "playerName": "Fred VanVleet", "ftmRank": 166, "ftPct": 84.3, "fg3Pct": 37.8, "teamId": 1610612761 }, { "playerName": "Furkan Korkmaz", "ftmRank": 324, "ftPct": 81.8, "fg3Pct": 32.6, "teamId": 1610612755 }, { "playerName": "Garrett Temple", "ftmRank": 236, "ftPct": 74.8, "fg3Pct": 34.1, "teamId": 1610612746 }, { "playerName": "Gary Clark", "ftmRank": 491, "ftPct": 100, "fg3Pct": 29.7, "teamId": 1610612745 }, { "playerName": "Gary Harris", "ftmRank": 109, "ftPct": 79.9, "fg3Pct": 33.900000000000006, "teamId": 1610612743 }, { "playerName": "Gary Payton II", "ftmRank": 497, "ftPct": 0, "fg3Pct": 50, "teamId": 1610612764 }, { "playerName": "Gary Trent Jr.", "ftmRank": 480, "ftPct": 42.9, "fg3Pct": 23.799999999999997, "teamId": 1610612757 }, { "playerName": "George Hill", "ftmRank": 214, "ftPct": 82.39999999999999, "fg3Pct": 31.4, "teamId": 1610612749 }, { "playerName": "George King", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612756 }, { "playerName": "Georges Niang", "ftmRank": 443, "ftPct": 83.3, "fg3Pct": 41, "teamId": 1610612762 }, { "playerName": "Gerald Green", "ftmRank": 318, "ftPct": 83.8, "fg3Pct": 35.4, "teamId": 1610612745 }, { "playerName": "Giannis Antetokounmpo", "ftmRank": 3, "ftPct": 72.89999999999999, "fg3Pct": 25.6, "teamId": 1610612749 }, { "playerName": "Glenn Robinson III", "ftmRank": 348, "ftPct": 80, "fg3Pct": 28.999999999999996, "teamId": 1610612765 }, { "playerName": "Goran Dragic", "ftmRank": 97, "ftPct": 78.2, "fg3Pct": 34.8, "teamId": 1610612748 }, { "playerName": "Gordon Hayward", "ftmRank": 98, "ftPct": 83.39999999999999, "fg3Pct": 33.300000000000004, "teamId": 1610612738 }, { "playerName": "Gorgui Dieng", "ftmRank": 219, "ftPct": 83, "fg3Pct": 33.900000000000006, "teamId": 1610612750 }, { "playerName": "Grayson Allen", "ftmRank": 213, "ftPct": 75, "fg3Pct": 32.300000000000004, "teamId": 1610612762 }, { "playerName": "Greg Monroe", "ftmRank": 240, "ftPct": 62.5, "fg3Pct": 20, "teamId": 1610612755 }, { "playerName": "Guerschon Yabusele", "ftmRank": 434, "ftPct": 68.2, "fg3Pct": 32.1, "teamId": 1610612738 }, { "playerName": "Hamidou Diallo", "ftmRank": 334, "ftPct": 61, "fg3Pct": 16.7, "teamId": 1610612760 }, { "playerName": "Harrison Barnes", "ftmRank": 52, "ftPct": 82.39999999999999, "fg3Pct": 39.5, "teamId": 1610612758 }, { "playerName": "Harry Giles III", "ftmRank": 249, "ftPct": 63.7, "fg3Pct": 0, "teamId": 1610612758 }, { "playerName": "Hassan Whiteside", "ftmRank": 167, "ftPct": 44.9, "fg3Pct": 12.5, "teamId": 1610612748 }, { "playerName": "Haywood Highsmith", "ftmRank": 497, "ftPct": 0, "fg3Pct": 20, "teamId": 1610612755 }, { "playerName": "Henry Ellenson", "ftmRank": 249, "ftPct": 76, "fg3Pct": 44.7, "teamId": 1610612752 }, { "playerName": "Ian Clark", "ftmRank": 378, "ftPct": 89.2, "fg3Pct": 32.7, "teamId": 1610612740 }, { "playerName": "Ian Mahinmi", "ftmRank": 197, "ftPct": 68.89999999999999, "fg3Pct": 18.8, "teamId": 1610612764 }, { "playerName": "Ike Anigbogu", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612754 }, { "playerName": "Iman Shumpert", "ftmRank": 372, "ftPct": 80, "fg3Pct": 34.8, "teamId": 1610612745 }, { "playerName": "Isaac Bonga", "ftmRank": 420, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612747 }, { "playerName": "Isaac Humphries", "ftmRank": 497, "ftPct": 0, "fg3Pct": 27.3, "teamId": 1610612737 }, { "playerName": "Isaiah Briscoe", "ftmRank": 427, "ftPct": 57.699999999999996, "fg3Pct": 32.4, "teamId": 1610612753 }, { "playerName": "Isaiah Canaan", "ftmRank": 359, "ftPct": 79.2, "fg3Pct": 35.4, "teamId": 1610612749 }, { "playerName": "Isaiah Hartenstein", "ftmRank": 423, "ftPct": 78.60000000000001, "fg3Pct": 33.300000000000004, "teamId": 1610612745 }, { "playerName": "Isaiah Hicks", "ftmRank": 187, "ftPct": 80, "fg3Pct": 0, "teamId": 1610612752 }, { "playerName": "Isaiah Thomas", "ftmRank": 183, "ftPct": 63, "fg3Pct": 27.900000000000002, "teamId": 1610612743 }, { "playerName": "Ish Smith", "ftmRank": 298, "ftPct": 75.8, "fg3Pct": 32.6, "teamId": 1610612765 }, { "playerName": "Ivan Rabb", "ftmRank": 249, "ftPct": 71, "fg3Pct": 20, "teamId": 1610612763 }, { "playerName": "Ivica Zubac", "ftmRank": 147, "ftPct": 80.2, "fg3Pct": 0, "teamId": 1610612746 }, { "playerName": "J.J. Barea", "ftmRank": 175, "ftPct": 70.5, "fg3Pct": 29.7, "teamId": 1610612742 }, { "playerName": "J.P. Macura", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612766 }, { "playerName": "JJ Redick", "ftmRank": 50, "ftPct": 89.4, "fg3Pct": 39.7, "teamId": 1610612755 }, { "playerName": "JR Smith", "ftmRank": 331, "ftPct": 80, "fg3Pct": 30.8, "teamId": 1610612739 }, { "playerName": "JaKarr Sampson", "ftmRank": 25, "ftPct": 81, "fg3Pct": 35.699999999999996, "teamId": 1610612741 }, { "playerName": "JaMychal Green", "ftmRank": 203, "ftPct": 79.2, "fg3Pct": 40.300000000000004, "teamId": 1610612746 }, { "playerName": "JaVale McGee", "ftmRank": 195, "ftPct": 63.2, "fg3Pct": 8.3, "teamId": 1610612747 }, { "playerName": "Jabari Parker", "ftmRank": 104, "ftPct": 71.2, "fg3Pct": 31.3, "teamId": 1610612764 }, { "playerName": "Jacob Evans", "ftmRank": 497, "ftPct": 0, "fg3Pct": 26.700000000000003, "teamId": 1610612744 }, { "playerName": "Jae Crowder", "ftmRank": 140, "ftPct": 72.1, "fg3Pct": 33.1, "teamId": 1610612762 }, { "playerName": "Jahlil Okafor", "ftmRank": 249, "ftPct": 66.3, "fg3Pct": 20, "teamId": 1610612740 }, { "playerName": "Jake Layman", "ftmRank": 336, "ftPct": 70.39999999999999, "fg3Pct": 32.6, "teamId": 1610612757 }, { "playerName": "Jakob Poeltl", "ftmRank": 358, "ftPct": 53.300000000000004, "fg3Pct": 0, "teamId": 1610612759 }, { "playerName": "Jalen Brunson", "ftmRank": 211, "ftPct": 72.5, "fg3Pct": 34.8, "teamId": 1610612742 }, { "playerName": "Jalen Jones", "ftmRank": 212, "ftPct": 70.39999999999999, "fg3Pct": 35.699999999999996, "teamId": 1610612739 }, { "playerName": "Jamal Crawford", "ftmRank": 174, "ftPct": 84.5, "fg3Pct": 33.2, "teamId": 1610612756 }, { "playerName": "Jamal Murray", "ftmRank": 73, "ftPct": 84.8, "fg3Pct": 36.7, "teamId": 1610612743 }, { "playerName": "James Ennis III", "ftmRank": 249, "ftPct": 71.6, "fg3Pct": 35.3, "teamId": 1610612755 }, { "playerName": "James Harden", "ftmRank": 1, "ftPct": 87.9, "fg3Pct": 36.8, "teamId": 1610612745 }, { "playerName": "James Johnson", "ftmRank": 275, "ftPct": 71.39999999999999, "fg3Pct": 33.6, "teamId": 1610612748 }, { "playerName": "James Nunnally", "ftmRank": 467, "ftPct": 100, "fg3Pct": 32, "teamId": 1610612745 }, { "playerName": "Jared Dudley", "ftmRank": 380, "ftPct": 69.6, "fg3Pct": 35.099999999999994, "teamId": 1610612751 }, { "playerName": "Jared Terrell", "ftmRank": 476, "ftPct": 50, "fg3Pct": 23.5, "teamId": 1610612750 }, { "playerName": "Jarell Martin", "ftmRank": 476, "ftPct": 81.8, "fg3Pct": 35.099999999999994, "teamId": 1610612753 }, { "playerName": "Jaren Jackson Jr.", "ftmRank": 70, "ftPct": 76.6, "fg3Pct": 35.9, "teamId": 1610612763 }, { "playerName": "Jaron Blossomgame", "ftmRank": 432, "ftPct": 76.9, "fg3Pct": 25.6, "teamId": 1610612739 }, { "playerName": "Jarred Vanderbilt", "ftmRank": 439, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612743 }, { "playerName": "Jarrett Allen", "ftmRank": 78, "ftPct": 70.89999999999999, "fg3Pct": 13.3, "teamId": 1610612751 }, { "playerName": "Jason Smith", "ftmRank": 338, "ftPct": 87.5, "fg3Pct": 34.599999999999994, "teamId": 1610612740 }, { "playerName": "Jawun Evans", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612760 }, { "playerName": "Jaylen Adams", "ftmRank": 479, "ftPct": 77.8, "fg3Pct": 33.800000000000004, "teamId": 1610612737 }, { "playerName": "Jaylen Brown", "ftmRank": 138, "ftPct": 65.8, "fg3Pct": 34.4, "teamId": 1610612738 }, { "playerName": "Jaylen Morris", "ftmRank": 470, "ftPct": 50, "fg3Pct": 33.300000000000004, "teamId": 1610612749 }, { "playerName": "Jayson Tatum", "ftmRank": 77, "ftPct": 85.5, "fg3Pct": 37.3, "teamId": 1610612738 }, { "playerName": "Jeff Green", "ftmRank": 82, "ftPct": 88.8, "fg3Pct": 34.699999999999996, "teamId": 1610612764 }, { "playerName": "Jeff Teague", "ftmRank": 54, "ftPct": 80.4, "fg3Pct": 33.300000000000004, "teamId": 1610612750 }, { "playerName": "Jemerrio Jones", "ftmRank": 485, "ftPct": 50, "fg3Pct": 20, "teamId": 1610612747 }, { "playerName": "Jerami Grant", "ftmRank": 116, "ftPct": 71, "fg3Pct": 39.2, "teamId": 1610612760 }, { "playerName": "Jeremy Lamb", "ftmRank": 55, "ftPct": 88.8, "fg3Pct": 34.8, "teamId": 1610612766 }, { "playerName": "Jeremy Lin", "ftmRank": 81, "ftPct": 83.8, "fg3Pct": 29.4, "teamId": 1610612761 }, { "playerName": "Jerian Grant", "ftmRank": 411, "ftPct": 65, "fg3Pct": 36.4, "teamId": 1610612753 }, { "playerName": "Jerome Robinson", "ftmRank": 482, "ftPct": 66.7, "fg3Pct": 31.6, "teamId": 1610612746 }, { "playerName": "Jerryd Bayless", "ftmRank": 402, "ftPct": 57.099999999999994, "fg3Pct": 29.599999999999998, "teamId": 1610612750 }, { "playerName": "Jevon Carter", "ftmRank": 349, "ftPct": 81.3, "fg3Pct": 33.300000000000004, "teamId": 1610612763 }, { "playerName": "Jimmer Fredette", "ftmRank": 249, "ftPct": 100, "fg3Pct": 0, "teamId": 1610612756 }, { "playerName": "Jimmy Butler", "ftmRank": 19, "ftPct": 85.5, "fg3Pct": 34.699999999999996, "teamId": 1610612755 }, { "playerName": "Joakim Noah", "ftmRank": 129, "ftPct": 71.6, "fg3Pct": 0, "teamId": 1610612763 }, { "playerName": "Jodie Meeks", "ftmRank": 492, "ftPct": 100, "fg3Pct": 44.4, "teamId": 1610612761 }, { "playerName": "Joe Chealey", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612766 }, { "playerName": "Joe Harris", "ftmRank": 175, "ftPct": 82.69999999999999, "fg3Pct": 47.4, "teamId": 1610612751 }, { "playerName": "Joe Ingles", "ftmRank": 237, "ftPct": 70.7, "fg3Pct": 39.1, "teamId": 1610612762 }, { "playerName": "Joel Embiid", "ftmRank": 2, "ftPct": 80.4, "fg3Pct": 30, "teamId": 1610612755 }, { "playerName": "John Collins", "ftmRank": 39, "ftPct": 76.3, "fg3Pct": 34.8, "teamId": 1610612737 }, { "playerName": "John Henson", "ftmRank": 412, "ftPct": 60, "fg3Pct": 35.5, "teamId": 1610612739 }, { "playerName": "John Holland", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612739 }, { "playerName": "John Jenkins", "ftmRank": 373, "ftPct": 83.3, "fg3Pct": 37.9, "teamId": 1610612752 }, { "playerName": "John Wall", "ftmRank": 32, "ftPct": 69.69999999999999, "fg3Pct": 30.2, "teamId": 1610612764 }, { "playerName": "Johnathan Motley", "ftmRank": 230, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612746 }, { "playerName": "Johnathan Williams", "ftmRank": 225, "ftPct": 56.3, "fg3Pct": 0, "teamId": 1610612747 }, { "playerName": "Jon Leuer", "ftmRank": 376, "ftPct": 74.2, "fg3Pct": 9.1, "teamId": 1610612765 }, { "playerName": "Jonah Bolden", "ftmRank": 453, "ftPct": 48.1, "fg3Pct": 35.4, "teamId": 1610612755 }, { "playerName": "Jonas Jerebko", "ftmRank": 286, "ftPct": 80, "fg3Pct": 36.7, "teamId": 1610612744 }, { "playerName": "Jonas Valanciunas", "ftmRank": 50, "ftPct": 79.5, "fg3Pct": 29.2, "teamId": 1610612763 }, { "playerName": "Jonathan Isaac", "ftmRank": 173, "ftPct": 81.5, "fg3Pct": 32.300000000000004, "teamId": 1610612753 }, { "playerName": "Jonathon Simmons", "ftmRank": 193, "ftPct": 74.2, "fg3Pct": 26.900000000000002, "teamId": 1610612755 }, { "playerName": "Jordan Bell", "ftmRank": 433, "ftPct": 61, "fg3Pct": 0, "teamId": 1610612744 }, { "playerName": "Jordan Clarkson", "ftmRank": 110, "ftPct": 84.39999999999999, "fg3Pct": 32.4, "teamId": 1610612739 }, { "playerName": "Jordan Loyd", "ftmRank": 324, "ftPct": 81.8, "fg3Pct": 50, "teamId": 1610612761 }, { "playerName": "Jordan McRae", "ftmRank": 242, "ftPct": 80, "fg3Pct": 28.599999999999998, "teamId": 1610612764 }, { "playerName": "Jordan Sibert", "ftmRank": 497, "ftPct": 0, "fg3Pct": 100, "teamId": 1610612737 }, { "playerName": "Jose Calderon", "ftmRank": 481, "ftPct": 81.8, "fg3Pct": 24.6, "teamId": 1610612765 }, { "playerName": "Josh Hart", "ftmRank": 303, "ftPct": 68.8, "fg3Pct": 33.6, "teamId": 1610612747 }, { "playerName": "Josh Jackson", "ftmRank": 137, "ftPct": 67.10000000000001, "fg3Pct": 32.4, "teamId": 1610612756 }, { "playerName": "Josh Okogie", "ftmRank": 160, "ftPct": 72.8, "fg3Pct": 27.900000000000002, "teamId": 1610612750 }, { "playerName": "Josh Richardson", "ftmRank": 65, "ftPct": 86.1, "fg3Pct": 35.699999999999996, "teamId": 1610612748 }, { "playerName": "Jrue Holiday", "ftmRank": 46, "ftPct": 76.8, "fg3Pct": 32.5, "teamId": 1610612740 }, { "playerName": "Juancho Hernangomez", "ftmRank": 270, "ftPct": 76.7, "fg3Pct": 36.5, "teamId": 1610612743 }, { "playerName": "Julian Washburn", "ftmRank": 485, "ftPct": 75, "fg3Pct": 20.8, "teamId": 1610612763 }, { "playerName": "Julius Randle", "ftmRank": 17, "ftPct": 73.1, "fg3Pct": 34.4, "teamId": 1610612740 }, { "playerName": "Justin Anderson", "ftmRank": 381, "ftPct": 74.3, "fg3Pct": 31.2, "teamId": 1610612737 }, { "playerName": "Justin Holiday", "ftmRank": 217, "ftPct": 89.60000000000001, "fg3Pct": 34.8, "teamId": 1610612763 }, { "playerName": "Justin Jackson", "ftmRank": 319, "ftPct": 78.5, "fg3Pct": 35.5, "teamId": 1610612742 }, { "playerName": "Justin Patton", "ftmRank": 444, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612755 }, { "playerName": "Justise Winslow", "ftmRank": 191, "ftPct": 62.8, "fg3Pct": 37.5, "teamId": 1610612748 }, { "playerName": "Jusuf Nurkic", "ftmRank": 31, "ftPct": 77.3, "fg3Pct": 10.299999999999999, "teamId": 1610612757 }, { "playerName": "Kadeem Allen", "ftmRank": 95, "ftPct": 77.8, "fg3Pct": 47.199999999999996, "teamId": 1610612752 }, { "playerName": "Kalin Lucas", "ftmRank": 110, "ftPct": 100, "fg3Pct": 0, "teamId": 1610612765 }, { "playerName": "Karl-Anthony Towns", "ftmRank": 16, "ftPct": 83.6, "fg3Pct": 40, "teamId": 1610612750 }, { "playerName": "Kawhi Leonard", "ftmRank": 6, "ftPct": 85.39999999999999, "fg3Pct": 37.1, "teamId": 1610612761 }, { "playerName": "Keita Bates-Diop", "ftmRank": 366, "ftPct": 64.3, "fg3Pct": 25, "teamId": 1610612750 }, { "playerName": "Kelly Olynyk", "ftmRank": 120, "ftPct": 82.19999999999999, "fg3Pct": 35.4, "teamId": 1610612748 }, { "playerName": "Kelly Oubre Jr.", "ftmRank": 64, "ftPct": 77.5, "fg3Pct": 32, "teamId": 1610612756 }, { "playerName": "Kemba Walker", "ftmRank": 22, "ftPct": 84.39999999999999, "fg3Pct": 35.6, "teamId": 1610612766 }, { "playerName": "Kenneth Faried", "ftmRank": 143, "ftPct": 64.60000000000001, "fg3Pct": 32, "teamId": 1610612745 }, { "playerName": "Kenrich Williams", "ftmRank": 460, "ftPct": 68.4, "fg3Pct": 33.300000000000004, "teamId": 1610612740 }, { "playerName": "Kent Bazemore", "ftmRank": 126, "ftPct": 72.6, "fg3Pct": 32, "teamId": 1610612737 }, { "playerName": "Kentavious Caldwell-Pope", "ftmRank": 151, "ftPct": 86.7, "fg3Pct": 34.699999999999996, "teamId": 1610612747 }, { "playerName": "Kevin Durant", "ftmRank": 9, "ftPct": 88.5, "fg3Pct": 35.3, "teamId": 1610612744 }, { "playerName": "Kevin Huerter", "ftmRank": 379, "ftPct": 73.2, "fg3Pct": 38.5, "teamId": 1610612737 }, { "playerName": "Kevin Knox", "ftmRank": 99, "ftPct": 71.7, "fg3Pct": 34.300000000000004, "teamId": 1610612752 }, { "playerName": "Kevin Love", "ftmRank": 21, "ftPct": 90.4, "fg3Pct": 36.1, "teamId": 1610612739 }, { "playerName": "Kevon Looney", "ftmRank": 307, "ftPct": 61.9, "fg3Pct": 10, "teamId": 1610612744 }, { "playerName": "Khem Birch", "ftmRank": 215, "ftPct": 69.89999999999999, "fg3Pct": 0, "teamId": 1610612753 }, { "playerName": "Khris Middleton", "ftmRank": 61, "ftPct": 83.7, "fg3Pct": 37.8, "teamId": 1610612749 }, { "playerName": "Khyri Thomas", "ftmRank": 466, "ftPct": 63.6, "fg3Pct": 28.599999999999998, "teamId": 1610612765 }, { "playerName": "Klay Thompson", "ftmRank": 154, "ftPct": 81.6, "fg3Pct": 40.2, "teamId": 1610612744 }, { "playerName": "Kobi Simmons", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612739 }, { "playerName": "Kosta Koufos", "ftmRank": 474, "ftPct": 41.699999999999996, "fg3Pct": 0, "teamId": 1610612758 }, { "playerName": "Kostas Antetokounmpo", "ftmRank": 249, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612742 }, { "playerName": "Kris Dunn", "ftmRank": 210, "ftPct": 79.7, "fg3Pct": 35.4, "teamId": 1610612741 }, { "playerName": "Kyle Anderson", "ftmRank": 289, "ftPct": 57.8, "fg3Pct": 26.5, "teamId": 1610612763 }, { "playerName": "Kyle Korver", "ftmRank": 290, "ftPct": 82.19999999999999, "fg3Pct": 39.7, "teamId": 1610612762 }, { "playerName": "Kyle Kuzma", "ftmRank": 68, "ftPct": 75.2, "fg3Pct": 30.3, "teamId": 1610612747 }, { "playerName": "Kyle Lowry", "ftmRank": 76, "ftPct": 83, "fg3Pct": 34.699999999999996, "teamId": 1610612761 }, { "playerName": "Kyle O'Quinn", "ftmRank": 429, "ftPct": 81, "fg3Pct": 8.3, "teamId": 1610612754 }, { "playerName": "Kyrie Irving", "ftmRank": 45, "ftPct": 87.3, "fg3Pct": 40.1, "teamId": 1610612738 }, { "playerName": "LaMarcus Aldridge", "ftmRank": 24, "ftPct": 84.7, "fg3Pct": 23.799999999999997, "teamId": 1610612759 }, { "playerName": "Lance Stephenson", "ftmRank": 330, "ftPct": 68.5, "fg3Pct": 37.1, "teamId": 1610612747 }, { "playerName": "Lance Thomas", "ftmRank": 370, "ftPct": 75, "fg3Pct": 27.800000000000004, "teamId": 1610612752 }, { "playerName": "Landry Shamet", "ftmRank": 269, "ftPct": 80.60000000000001, "fg3Pct": 42.199999999999996, "teamId": 1610612746 }, { "playerName": "Langston Galloway", "ftmRank": 248, "ftPct": 84.39999999999999, "fg3Pct": 35.5, "teamId": 1610612765 }, { "playerName": "Larry Nance Jr.", "ftmRank": 179, "ftPct": 71.6, "fg3Pct": 33.7, "teamId": 1610612739 }, { "playerName": "Lauri Markkanen", "ftmRank": 40, "ftPct": 87.2, "fg3Pct": 36.1, "teamId": 1610612741 }, { "playerName": "LeBron James", "ftmRank": 13, "ftPct": 66.5, "fg3Pct": 33.900000000000006, "teamId": 1610612747 }, { "playerName": "Lonnie Walker IV", "ftmRank": 402, "ftPct": 80, "fg3Pct": 38.5, "teamId": 1610612759 }, { "playerName": "Lonzo Ball", "ftmRank": 415, "ftPct": 41.699999999999996, "fg3Pct": 32.9, "teamId": 1610612747 }, { "playerName": "Lorenzo Brown", "ftmRank": 493, "ftPct": 100, "fg3Pct": 21.4, "teamId": 1610612761 }, { "playerName": "Lou Williams", "ftmRank": 10, "ftPct": 87.6, "fg3Pct": 36.1, "teamId": 1610612746 }, { "playerName": "Luc Mbah a Moute", "ftmRank": 388, "ftPct": 40, "fg3Pct": 33.300000000000004, "teamId": 1610612746 }, { "playerName": "Luka Doncic", "ftmRank": 18, "ftPct": 71.3, "fg3Pct": 32.7, "teamId": 1610612742 }, { "playerName": "Luke Kennard", "ftmRank": 309, "ftPct": 83.6, "fg3Pct": 39.4, "teamId": 1610612765 }, { "playerName": "Luke Kornet", "ftmRank": 301, "ftPct": 82.6, "fg3Pct": 36.3, "teamId": 1610612752 }, { "playerName": "Luol Deng", "ftmRank": 224, "ftPct": 71.39999999999999, "fg3Pct": 31.8, "teamId": 1610612750 }, { "playerName": "Malachi Richardson", "ftmRank": 482, "ftPct": 80, "fg3Pct": 32, "teamId": 1610612761 }, { "playerName": "Malcolm Brogdon", "ftmRank": 96, "ftPct": 92.80000000000001, "fg3Pct": 42.6, "teamId": 1610612749 }, { "playerName": "Malcolm Miller", "ftmRank": 451, "ftPct": 75, "fg3Pct": 47.599999999999994, "teamId": 1610612761 }, { "playerName": "Malik Beasley", "ftmRank": 346, "ftPct": 84.8, "fg3Pct": 40.2, "teamId": 1610612743 }, { "playerName": "Malik Monk", "ftmRank": 202, "ftPct": 88.2, "fg3Pct": 33, "teamId": 1610612766 }, { "playerName": "MarShon Brooks", "ftmRank": 311, "ftPct": 69.69999999999999, "fg3Pct": 27.800000000000004, "teamId": 1610612763 }, { "playerName": "Marc Gasol", "ftmRank": 80, "ftPct": 75.9, "fg3Pct": 36.3, "teamId": 1610612761 }, { "playerName": "Marcin Gortat", "ftmRank": 326, "ftPct": 72.89999999999999, "fg3Pct": 0, "teamId": 1610612746 }, { "playerName": "Marco Belinelli", "ftmRank": 182, "ftPct": 90.3, "fg3Pct": 37.2, "teamId": 1610612759 }, { "playerName": "Marcus Derrickson", "ftmRank": 436, "ftPct": 80, "fg3Pct": 50, "teamId": 1610612744 }, { "playerName": "Marcus Morris", "ftmRank": 118, "ftPct": 84.39999999999999, "fg3Pct": 37.5, "teamId": 1610612738 }, { "playerName": "Marcus Smart", "ftmRank": 192, "ftPct": 80.60000000000001, "fg3Pct": 36.4, "teamId": 1610612738 }, { "playerName": "Mario Hezonja", "ftmRank": 168, "ftPct": 76.3, "fg3Pct": 27.6, "teamId": 1610612752 }, { "playerName": "Markelle Fultz", "ftmRank": 227, "ftPct": 56.8, "fg3Pct": 28.599999999999998, "teamId": 1610612753 }, { "playerName": "Markieff Morris", "ftmRank": 206, "ftPct": 77.2, "fg3Pct": 33.5, "teamId": 1610612760 }, { "playerName": "Marquese Chriss", "ftmRank": 327, "ftPct": 71.1, "fg3Pct": 22.2, "teamId": 1610612739 }, { "playerName": "Marvin Bagley III", "ftmRank": 56, "ftPct": 69.1, "fg3Pct": 31.3, "teamId": 1610612758 }, { "playerName": "Marvin Williams", "ftmRank": 282, "ftPct": 76.7, "fg3Pct": 36.6, "teamId": 1610612766 }, { "playerName": "Mason Plumlee", "ftmRank": 186, "ftPct": 56.10000000000001, "fg3Pct": 20, "teamId": 1610612743 }, { "playerName": "Matthew Dellavedova", "ftmRank": 287, "ftPct": 80.80000000000001, "fg3Pct": 33.800000000000004, "teamId": 1610612739 }, { "playerName": "Maurice Harkless", "ftmRank": 306, "ftPct": 67.10000000000001, "fg3Pct": 27.500000000000004, "teamId": 1610612757 }, { "playerName": "Maxi Kleber", "ftmRank": 305, "ftPct": 78.4, "fg3Pct": 35.3, "teamId": 1610612742 }, { "playerName": "Melvin Frazier Jr.", "ftmRank": 494, "ftPct": 25, "fg3Pct": 0, "teamId": 1610612753 }, { "playerName": "Meyers Leonard", "ftmRank": 335, "ftPct": 84.3, "fg3Pct": 45, "teamId": 1610612757 }, { "playerName": "Michael Beasley", "ftmRank": 232, "ftPct": 71.8, "fg3Pct": 17.599999999999998, "teamId": 1610612747 }, { "playerName": "Michael Carter-Williams", "ftmRank": 221, "ftPct": 60.4, "fg3Pct": 26.3, "teamId": 1610612753 }, { "playerName": "Michael Kidd-Gilchrist", "ftmRank": 172, "ftPct": 77.2, "fg3Pct": 34, "teamId": 1610612766 }, { "playerName": "Mikal Bridges", "ftmRank": 217, "ftPct": 80.5, "fg3Pct": 33.5, "teamId": 1610612756 }, { "playerName": "Mike Conley", "ftmRank": 15, "ftPct": 84.5, "fg3Pct": 36.4, "teamId": 1610612763 }, { "playerName": "Mike Muscala", "ftmRank": 229, "ftPct": 82.39999999999999, "fg3Pct": 34.8, "teamId": 1610612747 }, { "playerName": "Mike Scott", "ftmRank": 463, "ftPct": 66.7, "fg3Pct": 40.1, "teamId": 1610612755 }, { "playerName": "Miles Bridges", "ftmRank": 332, "ftPct": 75.3, "fg3Pct": 32.5, "teamId": 1610612766 }, { "playerName": "Miles Plumlee", "ftmRank": 280, "ftPct": 53.300000000000004, "fg3Pct": 0, "teamId": 1610612737 }, { "playerName": "Milos Teodosic", "ftmRank": 467, "ftPct": 57.099999999999994, "fg3Pct": 37, "teamId": 1610612746 }, { "playerName": "Mitchell Creek", "ftmRank": 249, "ftPct": 71.39999999999999, "fg3Pct": 0, "teamId": 1610612750 }, { "playerName": "Mitchell Robinson", "ftmRank": 205, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612752 }, { "playerName": "Mo Bamba", "ftmRank": 316, "ftPct": 58.699999999999996, "fg3Pct": 30, "teamId": 1610612753 }, { "playerName": "Monte Morris", "ftmRank": 312, "ftPct": 80.2, "fg3Pct": 41.4, "teamId": 1610612743 }, { "playerName": "Montrezl Harrell", "ftmRank": 42, "ftPct": 64.3, "fg3Pct": 17.599999999999998, "teamId": 1610612746 }, { "playerName": "Moritz Wagner", "ftmRank": 249, "ftPct": 81.10000000000001, "fg3Pct": 28.599999999999998, "teamId": 1610612747 }, { "playerName": "Myles Turner", "ftmRank": 110, "ftPct": 73.6, "fg3Pct": 38.800000000000004, "teamId": 1610612754 }, { "playerName": "Naz Mitrou-Long", "ftmRank": 489, "ftPct": 100, "fg3Pct": 18.2, "teamId": 1610612762 }, { "playerName": "Nemanja Bjelica", "ftmRank": 275, "ftPct": 76.1, "fg3Pct": 40.1, "teamId": 1610612758 }, { "playerName": "Nene", "ftmRank": 328, "ftPct": 66, "fg3Pct": 0, "teamId": 1610612745 }, { "playerName": "Nerlens Noel", "ftmRank": 337, "ftPct": 68.4, "fg3Pct": 0, "teamId": 1610612760 }, { "playerName": "Nick Young", "ftmRank": 497, "ftPct": 0, "fg3Pct": 37.5, "teamId": 1610612743 }, { "playerName": "Nicolas Batum", "ftmRank": 245, "ftPct": 86.5, "fg3Pct": 38.9, "teamId": 1610612766 }, { "playerName": "Nik Stauskas", "ftmRank": 299, "ftPct": 89.1, "fg3Pct": 37.2, "teamId": 1610612739 }, { "playerName": "Nikola Jokic", "ftmRank": 36, "ftPct": 82.1, "fg3Pct": 30.7, "teamId": 1610612743 }, { "playerName": "Nikola Mirotic", "ftmRank": 89, "ftPct": 84.7, "fg3Pct": 36.5, "teamId": 1610612749 }, { "playerName": "Nikola Vucevic", "ftmRank": 93, "ftPct": 78.9, "fg3Pct": 36.4, "teamId": 1610612753 }, { "playerName": "Noah Vonleh", "ftmRank": 156, "ftPct": 71.2, "fg3Pct": 33.6, "teamId": 1610612752 }, { "playerName": "Norman Powell", "ftmRank": 243, "ftPct": 82.69999999999999, "fg3Pct": 40, "teamId": 1610612761 }, { "playerName": "OG Anunoby", "ftmRank": 383, "ftPct": 58.099999999999994, "fg3Pct": 33.2, "teamId": 1610612761 }, { "playerName": "Okaro White", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612764 }, { "playerName": "Omari Spellman", "ftmRank": 342, "ftPct": 71.1, "fg3Pct": 34.4, "teamId": 1610612737 }, { "playerName": "Omri Casspi", "ftmRank": 231, "ftPct": 67.2, "fg3Pct": 34.9, "teamId": 1610612763 }, { "playerName": "Otto Porter Jr.", "ftmRank": 184, "ftPct": 81.3, "fg3Pct": 40.6, "teamId": 1610612741 }, { "playerName": "PJ Dozier", "ftmRank": 485, "ftPct": 50, "fg3Pct": 25, "teamId": 1610612738 }, { "playerName": "PJ Tucker", "ftmRank": 388, "ftPct": 69.5, "fg3Pct": 37.7, "teamId": 1610612745 }, { "playerName": "Pascal Siakam", "ftmRank": 53, "ftPct": 78.5, "fg3Pct": 36.9, "teamId": 1610612761 }, { "playerName": "Pat Connaughton", "ftmRank": 401, "ftPct": 72.5, "fg3Pct": 33, "teamId": 1610612749 }, { "playerName": "Patrick Beverley", "ftmRank": 203, "ftPct": 78, "fg3Pct": 39.7, "teamId": 1610612746 }, { "playerName": "Patrick McCaw", "ftmRank": 408, "ftPct": 86.7, "fg3Pct": 32.1, "teamId": 1610612761 }, { "playerName": "Patrick Patterson", "ftmRank": 450, "ftPct": 63.3, "fg3Pct": 33.6, "teamId": 1610612760 }, { "playerName": "Patty Mills", "ftmRank": 235, "ftPct": 85.39999999999999, "fg3Pct": 39.4, "teamId": 1610612759 }, { "playerName": "Pau Gasol", "ftmRank": 271, "ftPct": 70, "fg3Pct": 46.2, "teamId": 1610612749 }, { "playerName": "Paul George", "ftmRank": 7, "ftPct": 83.89999999999999, "fg3Pct": 38.6, "teamId": 1610612760 }, { "playerName": "Paul Millsap", "ftmRank": 71, "ftPct": 72.7, "fg3Pct": 36.5, "teamId": 1610612743 }, { "playerName": "Quincy Acy", "ftmRank": 338, "ftPct": 70, "fg3Pct": 13.3, "teamId": 1610612756 }, { "playerName": "Quincy Pondexter", "ftmRank": 357, "ftPct": 81, "fg3Pct": 33.300000000000004, "teamId": 1610612759 }, { "playerName": "Quinn Cook", "ftmRank": 465, "ftPct": 76.9, "fg3Pct": 40.5, "teamId": 1610612744 }, { "playerName": "RJ Hunter", "ftmRank": 249, "ftPct": 50, "fg3Pct": 40, "teamId": 1610612738 }, { "playerName": "Rajon Rondo", "ftmRank": 388, "ftPct": 63.9, "fg3Pct": 35.9, "teamId": 1610612747 }, { "playerName": "Raul Neto", "ftmRank": 323, "ftPct": 84.8, "fg3Pct": 33.300000000000004, "teamId": 1610612762 }, { "playerName": "Rawle Alkins", "ftmRank": 310, "ftPct": 66.7, "fg3Pct": 25, "teamId": 1610612741 }, { "playerName": "Ray Spalding", "ftmRank": 454, "ftPct": 33.300000000000004, "fg3Pct": 0, "teamId": 1610612756 }, { "playerName": "Raymond Felton", "ftmRank": 436, "ftPct": 92.30000000000001, "fg3Pct": 32.800000000000004, "teamId": 1610612760 }, { "playerName": "Reggie Bullock", "ftmRank": 216, "ftPct": 85.9, "fg3Pct": 37.7, "teamId": 1610612747 }, { "playerName": "Reggie Jackson", "ftmRank": 74, "ftPct": 86.4, "fg3Pct": 36.9, "teamId": 1610612765 }, { "playerName": "Richaun Holmes", "ftmRank": 132, "ftPct": 73.1, "fg3Pct": 0, "teamId": 1610612756 }, { "playerName": "Ricky Rubio", "ftmRank": 57, "ftPct": 85.5, "fg3Pct": 31.1, "teamId": 1610612762 }, { "playerName": "Robert Covington", "ftmRank": 119, "ftPct": 76.4, "fg3Pct": 37.8, "teamId": 1610612750 }, { "playerName": "Robert Williams III", "ftmRank": 461, "ftPct": 60, "fg3Pct": 0, "teamId": 1610612738 }, { "playerName": "Robin Lopez", "ftmRank": 209, "ftPct": 72.39999999999999, "fg3Pct": 22.6, "teamId": 1610612741 }, { "playerName": "Rodions Kurucs", "ftmRank": 221, "ftPct": 78.3, "fg3Pct": 31.5, "teamId": 1610612751 }, { "playerName": "Rodney Hood", "ftmRank": 124, "ftPct": 88.4, "fg3Pct": 35.6, "teamId": 1610612757 }, { "playerName": "Rodney McGruder", "ftmRank": 315, "ftPct": 72.2, "fg3Pct": 35.099999999999994, "teamId": 1610612746 }, { "playerName": "Ron Baker", "ftmRank": 444, "ftPct": 83.3, "fg3Pct": 7.7, "teamId": 1610612764 }, { "playerName": "Rondae Hollis-Jefferson", "ftmRank": 110, "ftPct": 64.5, "fg3Pct": 18.4, "teamId": 1610612751 }, { "playerName": "Royce O'Neale", "ftmRank": 425, "ftPct": 76.2, "fg3Pct": 38.6, "teamId": 1610612762 }, { "playerName": "Rudy Gay", "ftmRank": 142, "ftPct": 81.6, "fg3Pct": 40.2, "teamId": 1610612759 }, { "playerName": "Rudy Gobert", "ftmRank": 29, "ftPct": 63.6, "fg3Pct": 0, "teamId": 1610612762 }, { "playerName": "Russell Westbrook", "ftmRank": 30, "ftPct": 65.60000000000001, "fg3Pct": 28.999999999999996, "teamId": 1610612760 }, { "playerName": "Ryan Anderson", "ftmRank": 399, "ftPct": 75, "fg3Pct": 22.5, "teamId": 1610612748 }, { "playerName": "Ryan Arcidiacono", "ftmRank": 228, "ftPct": 87.3, "fg3Pct": 37.3, "teamId": 1610612741 }, { "playerName": "Ryan Broekhoff", "ftmRank": 438, "ftPct": 78.9, "fg3Pct": 40.9, "teamId": 1610612742 }, { "playerName": "Salah Mejri", "ftmRank": 377, "ftPct": 62.5, "fg3Pct": 32.4, "teamId": 1610612742 }, { "playerName": "Sam Dekker", "ftmRank": 367, "ftPct": 60.9, "fg3Pct": 30.599999999999998, "teamId": 1610612764 }, { "playerName": "Scott Machado", "ftmRank": 470, "ftPct": 100, "fg3Pct": 100, "teamId": 1610612747 }, { "playerName": "Semi Ojeleye", "ftmRank": 412, "ftPct": 61.5, "fg3Pct": 31.5, "teamId": 1610612738 }, { "playerName": "Serge Ibaka", "ftmRank": 134, "ftPct": 76.3, "fg3Pct": 28.999999999999996, "teamId": 1610612761 }, { "playerName": "Seth Curry", "ftmRank": 368, "ftPct": 84.6, "fg3Pct": 45, "teamId": 1610612757 }, { "playerName": "Shabazz Napier", "ftmRank": 103, "ftPct": 83.3, "fg3Pct": 33.300000000000004, "teamId": 1610612751 }, { "playerName": "Shai Gilgeous-Alexander", "ftmRank": 125, "ftPct": 80, "fg3Pct": 36.7, "teamId": 1610612746 }, { "playerName": "Shake Milton", "ftmRank": 470, "ftPct": 71.39999999999999, "fg3Pct": 31.8, "teamId": 1610612755 }, { "playerName": "Shaquille Harrison", "ftmRank": 226, "ftPct": 66.7, "fg3Pct": 27, "teamId": 1610612741 }, { "playerName": "Shaun Livingston", "ftmRank": 360, "ftPct": 78.4, "fg3Pct": 0, "teamId": 1610612744 }, { "playerName": "Shelvin Mack", "ftmRank": 247, "ftPct": 69, "fg3Pct": 35.4, "teamId": 1610612766 }, { "playerName": "Sindarius Thornwell", "ftmRank": 424, "ftPct": 73.5, "fg3Pct": 20, "teamId": 1610612746 }, { "playerName": "Skal Labissiere", "ftmRank": 420, "ftPct": 52.900000000000006, "fg3Pct": 46.2, "teamId": 1610612757 }, { "playerName": "Solomon Hill", "ftmRank": 385, "ftPct": 71.89999999999999, "fg3Pct": 31.7, "teamId": 1610612740 }, { "playerName": "Spencer Dinwiddie", "ftmRank": 27, "ftPct": 80.60000000000001, "fg3Pct": 33.5, "teamId": 1610612751 }, { "playerName": "Stanley Johnson", "ftmRank": 322, "ftPct": 78.10000000000001, "fg3Pct": 28.799999999999997, "teamId": 1610612740 }, { "playerName": "Stephen Curry", "ftmRank": 33, "ftPct": 91.60000000000001, "fg3Pct": 43.7, "teamId": 1610612744 }, { "playerName": "Sterling Brown", "ftmRank": 388, "ftPct": 69, "fg3Pct": 36.1, "teamId": 1610612749 }, { "playerName": "Steven Adams", "ftmRank": 133, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612760 }, { "playerName": "Svi Mykhailiuk", "ftmRank": 454, "ftPct": 60, "fg3Pct": 32.6, "teamId": 1610612765 }, { "playerName": "T.J. McConnell", "ftmRank": 428, "ftPct": 78.4, "fg3Pct": 33.300000000000004, "teamId": 1610612755 }, { "playerName": "T.J. Warren", "ftmRank": 85, "ftPct": 81.5, "fg3Pct": 42.8, "teamId": 1610612756 }, { "playerName": "TJ Leaf", "ftmRank": 448, "ftPct": 61.3, "fg3Pct": 25.8, "teamId": 1610612754 }, { "playerName": "Tahjere McCall", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612751 }, { "playerName": "Taj Gibson", "ftmRank": 121, "ftPct": 75.7, "fg3Pct": 32.4, "teamId": 1610612750 }, { "playerName": "Taurean Prince", "ftmRank": 145, "ftPct": 81.89999999999999, "fg3Pct": 39, "teamId": 1610612737 }, { "playerName": "Terrance Ferguson", "ftmRank": 388, "ftPct": 72.5, "fg3Pct": 36.6, "teamId": 1610612760 }, { "playerName": "Terrence Jones", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612745 }, { "playerName": "Terrence Ross", "ftmRank": 164, "ftPct": 87.5, "fg3Pct": 38.3, "teamId": 1610612753 }, { "playerName": "Terry Rozier", "ftmRank": 273, "ftPct": 78.5, "fg3Pct": 35.3, "teamId": 1610612738 }, { "playerName": "Thabo Sefolosha", "ftmRank": 462, "ftPct": 63.6, "fg3Pct": 43.6, "teamId": 1610612762 }, { "playerName": "Thaddeus Young", "ftmRank": 233, "ftPct": 64.4, "fg3Pct": 34.9, "teamId": 1610612754 }, { "playerName": "Theo Pinson", "ftmRank": 239, "ftPct": 86.4, "fg3Pct": 26.1, "teamId": 1610612751 }, { "playerName": "Thomas Bryant", "ftmRank": 171, "ftPct": 78.10000000000001, "fg3Pct": 33.300000000000004, "teamId": 1610612764 }, { "playerName": "Thomas Welsh", "ftmRank": 495, "ftPct": 50, "fg3Pct": 42.9, "teamId": 1610612743 }, { "playerName": "Thon Maker", "ftmRank": 287, "ftPct": 66.7, "fg3Pct": 32, "teamId": 1610612765 }, { "playerName": "Tim Frazier", "ftmRank": 344, "ftPct": 75.9, "fg3Pct": 36.6, "teamId": 1610612749 }, { "playerName": "Tim Hardaway Jr.", "ftmRank": 37, "ftPct": 84.1, "fg3Pct": 34, "teamId": 1610612742 }, { "playerName": "Timothe Luwawu-Cabarrot", "ftmRank": 361, "ftPct": 75.6, "fg3Pct": 31, "teamId": 1610612741 }, { "playerName": "Tobias Harris", "ftmRank": 42, "ftPct": 86.6, "fg3Pct": 39.7, "teamId": 1610612755 }, { "playerName": "Tomas Satoransky", "ftmRank": 155, "ftPct": 81.89999999999999, "fg3Pct": 39.5, "teamId": 1610612764 }, { "playerName": "Tony Bradley", "ftmRank": 444, "ftPct": 50, "fg3Pct": 0, "teamId": 1610612762 }, { "playerName": "Tony Parker", "ftmRank": 158, "ftPct": 73.4, "fg3Pct": 25.5, "teamId": 1610612766 }, { "playerName": "Tony Snell", "ftmRank": 388, "ftPct": 88.1, "fg3Pct": 39.7, "teamId": 1610612749 }, { "playerName": "Torrey Craig", "ftmRank": 355, "ftPct": 70, "fg3Pct": 32.4, "teamId": 1610612743 }, { "playerName": "Trae Young", "ftmRank": 26, "ftPct": 82.89999999999999, "fg3Pct": 32.4, "teamId": 1610612737 }, { "playerName": "Treveon Graham", "ftmRank": 387, "ftPct": 81.8, "fg3Pct": 29.7, "teamId": 1610612751 }, { "playerName": "Trevon Duval", "ftmRank": 497, "ftPct": 0, "fg3Pct": 100, "teamId": 1610612745 }, { "playerName": "Trevor Ariza", "ftmRank": 127, "ftPct": 79.3, "fg3Pct": 33.4, "teamId": 1610612764 }, { "playerName": "Trey Burke", "ftmRank": 139, "ftPct": 83.1, "fg3Pct": 35.199999999999996, "teamId": 1610612742 }, { "playerName": "Trey Lyles", "ftmRank": 196, "ftPct": 69.8, "fg3Pct": 25.5, "teamId": 1610612743 }, { "playerName": "Tristan Thompson", "ftmRank": 162, "ftPct": 64.2, "fg3Pct": 0, "teamId": 1610612739 }, { "playerName": "Troy Brown Jr.", "ftmRank": 363, "ftPct": 68.10000000000001, "fg3Pct": 31.900000000000002, "teamId": 1610612764 }, { "playerName": "Troy Caupain", "ftmRank": 497, "ftPct": 0, "fg3Pct": 66.7, "teamId": 1610612753 }, { "playerName": "Troy Daniels", "ftmRank": 439, "ftPct": 78.3, "fg3Pct": 38.1, "teamId": 1610612756 }, { "playerName": "Troy Williams", "ftmRank": 412, "ftPct": 60, "fg3Pct": 31.8, "teamId": 1610612758 }, { "playerName": "Tyler Cavanaugh", "ftmRank": 482, "ftPct": 100, "fg3Pct": 20, "teamId": 1610612762 }, { "playerName": "Tyler Davis", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612760 }, { "playerName": "Tyler Dorsey", "ftmRank": 313, "ftPct": 62.3, "fg3Pct": 33.300000000000004, "teamId": 1610612763 }, { "playerName": "Tyler Johnson", "ftmRank": 152, "ftPct": 74.8, "fg3Pct": 34.599999999999994, "teamId": 1610612756 }, { "playerName": "Tyler Lydon", "ftmRank": 496, "ftPct": 33.300000000000004, "fg3Pct": 40, "teamId": 1610612743 }, { "playerName": "Tyler Ulis", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612741 }, { "playerName": "Tyler Zeller", "ftmRank": 86, "ftPct": 77.8, "fg3Pct": 0, "teamId": 1610612763 }, { "playerName": "Tyreke Evans", "ftmRank": 152, "ftPct": 71.89999999999999, "fg3Pct": 35.6, "teamId": 1610612754 }, { "playerName": "Tyrone Wallace", "ftmRank": 398, "ftPct": 52.6, "fg3Pct": 21.099999999999998, "teamId": 1610612746 }, { "playerName": "Tyson Chandler", "ftmRank": 272, "ftPct": 58.599999999999994, "fg3Pct": 0, "teamId": 1610612747 }, { "playerName": "Tyus Jones", "ftmRank": 293, "ftPct": 84.1, "fg3Pct": 31.7, "teamId": 1610612750 }, { "playerName": "Udonis Haslem", "ftmRank": 451, "ftPct": 75, "fg3Pct": 0, "teamId": 1610612748 }, { "playerName": "Victor Oladipo", "ftmRank": 58, "ftPct": 73, "fg3Pct": 34.300000000000004, "teamId": 1610612754 }, { "playerName": "Vince Carter", "ftmRank": 362, "ftPct": 71.2, "fg3Pct": 38.9, "teamId": 1610612737 }, { "playerName": "Vincent Edwards", "ftmRank": 497, "ftPct": 0, "fg3Pct": 25, "teamId": 1610612745 }, { "playerName": "Wade Baldwin IV", "ftmRank": 388, "ftPct": 72.7, "fg3Pct": 22.2, "teamId": 1610612757 }, { "playerName": "Walter Lemon Jr.", "ftmRank": 187, "ftPct": 72.7, "fg3Pct": 40, "teamId": 1610612741 }, { "playerName": "Wayne Ellington", "ftmRank": 329, "ftPct": 79.60000000000001, "fg3Pct": 37.1, "teamId": 1610612765 }, { "playerName": "Wayne Selden", "ftmRank": 279, "ftPct": 72.8, "fg3Pct": 31.6, "teamId": 1610612741 }, { "playerName": "Wendell Carter Jr.", "ftmRank": 108, "ftPct": 79.5, "fg3Pct": 18.8, "teamId": 1610612741 }, { "playerName": "Wes Iwundu", "ftmRank": 197, "ftPct": 81.6, "fg3Pct": 36.7, "teamId": 1610612753 }, { "playerName": "Wesley Johnson", "ftmRank": 442, "ftPct": 68.4, "fg3Pct": 32.9, "teamId": 1610612764 }, { "playerName": "Wesley Matthews", "ftmRank": 123, "ftPct": 81, "fg3Pct": 37.2, "teamId": 1610612754 }, { "playerName": "Will Barton", "ftmRank": 189, "ftPct": 77, "fg3Pct": 34.2, "teamId": 1610612743 }, { "playerName": "Willie Cauley-Stein", "ftmRank": 144, "ftPct": 55.1, "fg3Pct": 50, "teamId": 1610612758 }, { "playerName": "Willy Hernangomez", "ftmRank": 146, "ftPct": 69.39999999999999, "fg3Pct": 38.5, "teamId": 1610612766 }, { "playerName": "Wilson Chandler", "ftmRank": 439, "ftPct": 72, "fg3Pct": 37.3, "teamId": 1610612746 }, { "playerName": "Yante Maten", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612748 }, { "playerName": "Yogi Ferrell", "ftmRank": 296, "ftPct": 89.60000000000001, "fg3Pct": 36.199999999999996, "teamId": 1610612758 }, { "playerName": "Yuta Watanabe", "ftmRank": 404, "ftPct": 70, "fg3Pct": 12.5, "teamId": 1610612763 }, { "playerName": "Zach Collins", "ftmRank": 208, "ftPct": 74.6, "fg3Pct": 33.1, "teamId": 1610612757 }, { "playerName": "Zach LaVine", "ftmRank": 14, "ftPct": 83.2, "fg3Pct": 37.4, "teamId": 1610612741 }, { "playerName": "Zach Lofton", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612765 }, { "playerName": "Zaza Pachulia", "ftmRank": 180, "ftPct": 78.2, "fg3Pct": 0, "teamId": 1610612765 }, { "playerName": "Zhaire Smith", "ftmRank": 249, "ftPct": 75, "fg3Pct": 37.5, "teamId": 1610612755 }, { "playerName": "Zhou Qi", "ftmRank": 497, "ftPct": 0, "fg3Pct": 0, "teamId": 1610612745 }];
exports.datajs = datajs;

},{}],3:[function(require,module,exports){
'use strict';

var GRID_SIZE;

document.getElementById('_drawMaze').onclick = drawMaze;
document.getElementById('_drawMaze').click();

function drawMaze() {
    var canvasContainer = document.getElementById('mazeCanvasContainer');
    canvasContainer.style.margin = '10px';
    GRID_SIZE = +document.getElementById('_gridSize').value;
    var oldCanvas = document.getElementById('mazeCanvas');
    if (!!oldCanvas) {
        canvasContainer.removeChild(oldCanvas);
    }
    var m = document.createElement('canvas');
    // m.style.border = '1px solid black';
    m.id = "mazeCanvas";
    m.width = +document.getElementById('_mazeWidth').value * GRID_SIZE;
    m.height = +document.getElementById('_mazeHeight').value * GRID_SIZE;
    m.style.zIndex = 8;
    canvasContainer.append(m);

    var mazeHeight = m.clientHeight,
        mazeWidth = m.clientWidth,
        gridSize = +document.getElementById('_gridSize').value;
    ctx = m.getContext('2d');
    mazeHeight = mazeHeight / GRID_SIZE;
    mazeWidth = mazeWidth / GRID_SIZE;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = 'rgb(0, 0, 0, 1)';;
    ctx.lineWidth = 2;

    var image = m.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception.
    document.getElementById('_saveCanvas').onclick = function () {
        var link = document.getElementById('_canvasSaveAs');
        var fileName = document.getElementById('_fileName').value;
        if (fileName === null || fileName.length == 0) {
            fileName = 'MyMaze';
        }
        link.setAttribute('download', fileName + '.png');
        link.setAttribute('href', m.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    };

    var data = {
        mazeHeight: mazeHeight,
        mazeWidth: mazeWidth,
        gridSize: gridSize
    };
    fetch('/maze', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        // console.log(response)
        return response.json();
    }).then(function (mTm) {
        ANIMATE = false;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = 'rgb(0, 0, 0, 1)';
        mazeToMake = mTm;
        initGrid(ctx, mTm, mazeHeight, mazeWidth);
    });
};

function initGrid(ctx, mazeToMake, mazeHeight, mazeWidth) {
    ctx.fillRect(
    /*x1*/
    0,
    /*y1*/
    0,
    /*width*/
    mazeWidth * GRID_SIZE,
    /*height*/
    mazeHeight * GRID_SIZE);
    if (!document.getElementById('_hideLines').checked) {
        for (var k = 0; k <= mazeWidth * GRID_SIZE; k += GRID_SIZE) {
            //iterate through columns
            ctx.beginPath();
            ctx.moveTo(k, 0);
            ctx.lineTo(k, mazeHeight * GRID_SIZE);
            ctx.stroke();
            ctx.closePath();
        }
        for (var j = 0; j <= mazeHeight * GRID_SIZE; j += GRID_SIZE) {
            //iterate through rows
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(mazeWidth * GRID_SIZE, j);
            ctx.stroke();
            ctx.closePath();
        }
    }
    for (var i = 0; i < mazeHeight; i++) {
        for (var n = 0; n < mazeWidth; n++) {
            mazeToMake[i][n].visited = false;
            if (!document.getElementById('_hideLines').checked) {
                for (var dir in mazeToMake[i][n].brokenWalls) {
                    breakWall(mazeToMake[i][n], mazeToMake[i][n].brokenWalls[dir], ctx);
                }
            }
        }
    }
}

function breakWall(node, direction, ctx) {
    // console.log("Break " + direction, node.id)
    // node.brokenWall = direction;
    if (direction == 'east') {
        // console.log("Break East", node.wallX);
        // console.log("Node width,height", (node.wallX - node.wallX + GRID_SIZE), (node.wallY - node.wallY + GRID_SIZE));
        //Break right wall

        ctx.fillRect(
        /*x1*/
        node.wallX + GRID_SIZE - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        GRID_SIZE - 2);
    }
    if (direction == 'west') {
        // console.log("Break West", node.wallX);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        GRID_SIZE - 2);
    }
    if (direction == 'north') {
        // console.log("Break North", node.wallY);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX + 1,
        /*y1*/
        node.wallY - 4,
        /*width*/
        GRID_SIZE - 2,
        /*height*/
        8);
    }
    if (direction == 'south') {
        // console.log("Break South", node.wallY);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX + 1,
        /*y1*/
        node.wallY + GRID_SIZE - 4,
        /*width*/
        GRID_SIZE - 2,
        /*height*/
        8);
    }
}

},{}],4:[function(require,module,exports){
"use strict";

document.addEventListener("DOMContentLoaded", function (event) {
    var c = document.getElementById("gameOfLifeCanvas");
    var g = document.getElementById("gridCanvas");
    var overLayHeight = g.height;
    var overLayWidth = g.width;
    var gridHeight = c.height;
    var gridWidth = c.width;
    var theGrid = createArray(gridWidth);
    var mirrorGrid = createArray(gridWidth);
    var ctx = c.getContext("2d");
    var overlayCtx = g.getContext("2d");
    var requestId,
        fpsInterval,
        then,
        startTime,
        now,
        elapsed,
        SQUARE_SIZE = 20;
    ctx.fillStyle = "#000000";

    fillRandom(); //create the starting state for the grid by filling it with random cells
    drawGrid();
    initGrid();
    //startAnimating(20);
    //tick(); //call main loop

    // initialize the timer variables and start the animation

    function startAnimating(fps) {
        fpsInterval = FPSINTERVALNUM / fps;
        then = Date.now();
        startTime = then;
        animate();
    }

    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved

    function animate() {

        // request another frame

        requestId = window.requestAnimationFrame(animate);

        // calc elapsed time since last loop

        now = Date.now();
        elapsed = now - then;

        // if enough time has elapsed, draw the next frame

        if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - elapsed % fpsInterval;

            // Put your drawing code here
            drawGrid();
            updateGrid();
        }
    }

    function stop() {
        if (requestId) {
            window.cancelAnimationFrame(requestId);
            requestId = undefined;
        }
    }

    c.onclick = function (evt) {
        var posRaw = getMousePos(c, evt);
        var pos = {
            x: Math.floor(posRaw.x / SQUARE_SIZE) * SQUARE_SIZE,
            y: Math.floor(posRaw.y / SQUARE_SIZE) * SQUARE_SIZE
        };
        theGrid[pos.x][pos.y] = 1 - theGrid[pos.x][pos.y];
        drawGrid();
    };

    document.getElementById("animateButton").onclick = function () {
        startAnimating(document.getElementById("animationSpeed").value || 20);
    };

    document.getElementById("stopButton").onclick = function () {
        stop();
    };

    document.getElementById("resetButton").onclick = function () {
        fillRandom();
        drawGrid();
    };
    document.getElementById("clearButton").onclick = function () {
        clearGrid();
    };

    function fillRandom() {
        //fill the grid randomly
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
                theGrid[j][k] = Math.round(Math.random());
            }
        }
    }

    function clearGrid() {
        ctx.clearRect(0, 0, gridHeight, gridWidth);
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
                theGrid[j][k] = 0;
            }
        }
    }

    function initGrid() {
        for (var k = 0; k <= gridWidth; k += SQUARE_SIZE) {
            //iterate through columns
            overlayCtx.beginPath();
            overlayCtx.moveTo(k, 0);
            overlayCtx.lineTo(k, gridHeight);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
        for (var j = 0; j <= gridHeight; j += SQUARE_SIZE) {
            //iterate through rows
            overlayCtx.beginPath();
            overlayCtx.moveTo(0, j);
            overlayCtx.lineTo(gridWidth, j);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
    }

    function drawGrid() {
        //draw the contents of the grid onto a canvas
        var liveCount = 0;
        ctx.clearRect(0, 0, gridHeight, gridWidth); //this should clear the canvas ahead of each redraw
        for (var j = SQUARE_SIZE; j < gridHeight; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth; k += SQUARE_SIZE) {
                //iterate through columns
                if (theGrid[j][k] === 1) {
                    ctx.fillRect(j, k, SQUARE_SIZE, SQUARE_SIZE);
                    liveCount++;
                }
            }
        }
        //console.log(liveCount / SQUARE_SIZE0);
    }

    function updateGrid() {
        //perform one iteration of grid update

        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
                var totalCells = 0;
                //add up the total values for the surrounding cells
                totalCells += theGrid[j - SQUARE_SIZE][k - SQUARE_SIZE]; //top left
                totalCells += theGrid[j - SQUARE_SIZE][k]; //top center
                totalCells += theGrid[j - SQUARE_SIZE][k + SQUARE_SIZE]; //top right

                totalCells += theGrid[j][k - SQUARE_SIZE]; //middle left
                totalCells += theGrid[j][k + SQUARE_SIZE]; //middle right

                totalCells += theGrid[j + SQUARE_SIZE][k - SQUARE_SIZE]; //bottom left
                totalCells += theGrid[j + SQUARE_SIZE][k]; //bottom center
                totalCells += theGrid[j + SQUARE_SIZE][k + SQUARE_SIZE]; //bottom right

                //apply the rules to each cell
                switch (totalCells) {
                    case 2:
                        mirrorGrid[j][k] = theGrid[j][k];

                        break;
                    case 3:
                        mirrorGrid[j][k] = 1; //live

                        break;
                    default:
                        mirrorGrid[j][k] = 0; //
                }
            }
        }

        //mirror edges to create wraparound effect

        for (var l = SQUARE_SIZE; l < gridHeight - 1; l += SQUARE_SIZE) {
            //iterate through rows
            //top and bottom
            mirrorGrid[l][0] = mirrorGrid[l][gridHeight - SQUARE_SIZE * 3];
            mirrorGrid[l][gridHeight - SQUARE_SIZE] = mirrorGrid[l][SQUARE_SIZE];
            //left and right
            mirrorGrid[0][l] = mirrorGrid[gridHeight - SQUARE_SIZE * 3][l];
            mirrorGrid[gridHeight - SQUARE_SIZE][l] = mirrorGrid[SQUARE_SIZE][l];
        }

        //swap grids
        var temp = theGrid;
        theGrid = mirrorGrid;
        mirrorGrid = temp;
    }
});

},{}],5:[function(require,module,exports){
'use strict';

var _drawMaze = require('./drawMaze.js');

var drawMaze = _interopRequireWildcard(_drawMaze);

var _playMaze = require('./playMaze.js');

var playMaze = _interopRequireWildcard(_playMaze);

var _solveMaze = require('./solveMaze.js');

var solveMaze = _interopRequireWildcard(_solveMaze);

var _gameOfLife = require('./gameOfLife.js');

var gameOfLife = _interopRequireWildcard(_gameOfLife);

var _nbaHandler = require('./nbaHandler.js');

var nbaHandler = _interopRequireWildcard(_nbaHandler);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

},{"./drawMaze.js":3,"./gameOfLife.js":4,"./nbaHandler.js":6,"./playMaze.js":7,"./solveMaze.js":8}],6:[function(require,module,exports){
'use strict';

var _teams = require('./teams.js');

var _d3NbaStats = require('./d3NbaStats.js');

// import * as d3 from 'd3'

function addNbaHandles() {

    var teamSelect = document.getElementById('teamSelect');
    var cbox = document.getElementById('realAllTeamsBox');
    var sortSelect = document.getElementById('sortSelect');
    _teams.teams.forEach(function (ele) {
        var opt = document.createElement('option');
        opt.value = ele.teamId;
        opt.innerHTML = ele.teamName;
        teamSelect.append(opt);
    });
    teamSelect.value = '1610612756';
    teamSelect.onchange = function (e) {
        (0, _d3NbaStats.nbaChartChange)(!cbox.checked);
    };
    sortSelect.onchange = function (e) {
        (0, _d3NbaStats.nbaChartChange)(!cbox.checked);
    };
    cbox.onchange = function (e) {
        teamSelect.disabled = !teamSelect.disabled;
        (0, _d3NbaStats.nbaChartChange)(!teamSelect.disabled, true);
        // d3.selectAll("path").transition()
        //     .delay(function (d, i) { return ((!teamSelect.disabled) ? 2 : 50) * i; })
        //     .duration(500)
        //     .attrTween("d", function (d) { return arcTweenReverse(d) })
        // d3.select("svg").transition()
        //     .duration(!teamSelect.disabled ? 1200 : 1000)
        //     .remove()
        //     .on("end", () => loadChart(teamSelect.disabled, sortSelect.value));
    };
    (0, _d3NbaStats.loadChart)(false, sortSelect.value);
}

addNbaHandles();

},{"./d3NbaStats.js":1,"./teams.js":9}],7:[function(require,module,exports){
'use strict';

var mazeControls = {
    38: {
        direction: 'north',
        newX: function newX(oldX) {
            return oldX;
        },
        newY: function newY(oldY) {
            return oldY - 1;
        }
    },
    37: {
        direction: 'west',
        newX: function newX(oldX) {
            return oldX - 1;
        },
        newY: function newY(oldY) {
            return oldY;
        }
    },
    39: {
        direction: 'east',
        newX: function newX(oldX) {
            return oldX + 1;
        },
        newY: function newY(oldY) {
            return oldY;
        }
    },
    40: {
        direction: 'south',
        newX: function newX(oldX) {
            return oldX;
        },
        newY: function newY(oldY) {
            return oldY + 1;
        }
    }
};

var dirOpposite = {
    'east': 'west',
    'west': 'east',
    'north': 'south',
    'south': 'north'
};

var mazePlayer = {
    startPlaying: function startPlaying() {
        var cur;
        var ctx = document.getElementById('mazeCanvas').getContext('2d');
        mazeToMake[0][0].fill(ctx, 'red');
        cur = {
            x: 0,
            y: 0
        };
        window.addEventListener('keydown', function (e) {
            // space and arrow keys
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }

            if (!!mazeControls[e.keyCode]) {
                if (!!mazeToMake[cur.y][cur.x].brokenWalls && mazeToMake[cur.y][cur.x].brokenWalls.indexOf(mazeControls[e.keyCode].direction) > -1) {
                    mazeToMake[cur.y][cur.x].fill(ctx, 'white');
                    cur.y = mazeControls[e.keyCode].newY(cur.y);
                    cur.x = mazeControls[e.keyCode].newX(cur.x);
                    if (!!mazeToMake[cur.y][cur.x].brokenWalls && mazeToMake[cur.y][cur.x].brokenWalls.indexOf(dirOpposite[mazeControls[e.keyCode].direction])) {
                        mazeToMake[cur.y][cur.x].brokenWalls.push(dirOpposite[mazeControls[e.keyCode].direction]);
                    } else if (!mazeToMake[cur.y][cur.x].brokenWalls) {

                        mazeToMake[cur.y][cur.x].brokenWalls = [dirOpposite[mazeControls[e.keyCode].direction]];
                    }
                    mazeToMake[cur.y][cur.x].fill(ctx, 'red');
                }
            }
        }, false);
    }
};

document.getElementById('_playMaze').onclick = mazePlayer.startPlaying;

},{}],8:[function(require,module,exports){
'use strict';

var mazeToSolve;
var mazeHeight;
var mazeWidth;
var currentNode;
var stack = [];
var directionsArr = ['east', 'west', 'north', 'south'];
var GRID_SIZE;
var SQUARE_MULTIPLYER = 1;

function init() {
    mazeToSolve = mazeToMake;
    mazeHeight = mazeToSolve.length;
    mazeWidth = mazeToSolve[0].length;
    GRID_SIZE = +document.getElementById('_gridSize').value;
    currentNode = mazeToSolve[0][0];
    currentNode.visited = true;
    ANIMATE = true;
    SQUARE_MULTIPLYER = !!document.getElementById('_squareSize').value ? document.getElementById('_squareSize').value : 1;

    Object.getPrototypeOf(mazeToMake[0][0]).fill = function (ctx, color) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
        }
        ctx.fillStyle = color;
        ctx.fillRect(
        /*x1*/
        this.wallX + 1,
        /*y1*/
        this.wallY + 1,
        /*width*/
        drawSizeW - 2,
        /*height*/
        drawSizeH - 2);
    };

    Object.getPrototypeOf(currentNode).fillPath = function (ctx, color, fromDir) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
        }
        ctx.fillStyle = color;
        if (fromDir == 'east') {
            ctx.fillRect(
            /*x1*/
            this.wallX - 1,
            /*y1*/
            this.wallY + 1,
            /*width*/
            2,
            /*height*/
            drawSizeH - 2);
        }
        if (fromDir == 'west') {
            ctx.fillRect(
            /*x1*/
            this.wallX + GRID_SIZE - 1,
            /*y1*/
            this.wallY + 1,
            /*width*/
            2,
            /*height*/
            drawSizeH - 2);
        }
        if (fromDir == 'north') {
            ctx.fillRect(
            /*x1*/
            this.wallX + 1,
            /*y1*/
            this.wallY + GRID_SIZE - 1,
            /*width*/
            drawSizeW - 2,
            /*height*/
            2);
        }
        if (fromDir == 'south') {
            ctx.fillRect(
            /*x1*/
            this.wallX + 1,
            /*y1*/
            this.wallY - 1,
            /*width*/
            drawSizeW - 2,
            /*height*/
            2);
        }
    };
    var color = document.getElementById('_color').value;
    currentNode.fill(ctx, color);
    stack.push(currentNode);
    window.requestAnimationFrame(draw);
}

function draw() {
    var ctx = document.getElementById('mazeCanvas').getContext('2d');
    var unvisitedNeighbors = nextUnvisited(currentNode);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

    unvisitedNeighbors = nextUnvisited(currentNode);

    if (unvisitedNeighbors.length) {
        stack.push(currentNode);
        randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        if (ANIMATE) {
            currentNode = move(currentNode, randomUnvisited);
            if (document.getElementById('_randomColor').checked) {
                currentNode.fill(ctx, '#' + Math.floor(Math.random() * 16777215).toString(16));
            } else {
                var color = document.getElementById('_color').value;
                currentNode.fill(ctx, color);
                currentNode.fillPath(ctx, color, randomUnvisited);
            }
        }
        // currentNode.fillPath(ctx, '#' + Math.floor(Math.random() * 16777215).toString(16), randomUnvisited);

        currentNode.fromDir = randomUnvisited;
    } else {
        currentNode.fill(ctx, '#ffffff');
        currentNode.fillPath(ctx, '#ffffff', currentNode.fromDir);

        currentNode = stack.pop();
    }

    if ((currentNode.x != mazeWidth - 1 || currentNode.y != mazeHeight - 1) && ANIMATE) {
        window.requestAnimationFrame(draw);
    }
}

function move(node, direction) {
    var nextNode = getNextNode(direction, node);
    if (!nextNode) {
        return false;
    }
    nextNode.visited = true;
    // breakWall(node, direction);
    return nextNode;
}

function nextUnvisited(node) {
    var unvisitedArr = [];
    var neighborNode;
    for (var i = 0; i < 4; i++) {
        neighborNode = getNextNode(directionsArr[i], node);
        if (!!neighborNode && !neighborNode.visited) {
            unvisitedArr.push(directionsArr[i]);
        }
    }
    return unvisitedArr;
}

function getNextNode(direction, node) {
    // console.log("get next node " + direction);
    //prolly need switch case
    if (!node.brokenWalls || node.brokenWalls.indexOf(direction) < 0) {
        return false;
    }
    if (direction == 'east') {
        // console.log("East", node.x, mazeWidth);
        if (node.x >= mazeWidth - 1) {
            return false;
        } else {
            // console.log("next node east ", mazeToSolve[node.y][node.x + 1])
            return mazeToSolve[node.y][node.x + 1];
        }
    }
    if (direction == 'west') {
        // console.log("West", node.x, mazeWidth);
        if (node.x <= 0) {
            return false;
        } else {
            // console.log("next node west ", mazeToSolve[node.y][node.x - 1])
            return mazeToSolve[node.y][node.x - 1];
        }
    }
    if (direction == 'north') {
        // console.log("North", node.y, mazeHeight);
        if (node.y <= 0) {
            return false;
        } else {
            // console.log("next node north ", mazeToSolve[node.y - 1][node.x])
            return mazeToSolve[node.y - 1][node.x];
        }
    }
    if (direction == 'south') {
        // console.log("South", node.y, mazeHeight);
        if (node.y >= mazeHeight - 1) {
            return false;
        } else {
            // console.log("next node south ", mazeToSolve[node.y + 1][node.x])
            return mazeToSolve[node.y + 1][node.x];
        }
    }
}

document.getElementById('_solveMaze').onclick = init;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var teams = [{
    "teamId": 1610612737,
    "abbreviation": "ATL",
    "teamName": "Atlanta Hawks",
    "simpleName": "Hawks",
    "location": "Atlanta"
}, {
    "teamId": 1610612738,
    "abbreviation": "BOS",
    "teamName": "Boston Celtics",
    "simpleName": "Celtics",
    "location": "Boston"
}, {
    "teamId": 1610612751,
    "abbreviation": "BKN",
    "teamName": "Brooklyn Nets",
    "simpleName": "Nets",
    "location": "Brooklyn"
}, {
    "teamId": 1610612766,
    "abbreviation": "CHA",
    "teamName": "Charlotte Hornets",
    "simpleName": "Hornets",
    "location": "Charlotte"
}, {
    "teamId": 1610612741,
    "abbreviation": "CHI",
    "teamName": "Chicago Bulls",
    "simpleName": "Bulls",
    "location": "Chicago"
}, {
    "teamId": 1610612739,
    "abbreviation": "CLE",
    "teamName": "Cleveland Cavaliers",
    "simpleName": "Cavaliers",
    "location": "Cleveland"
}, {
    "teamId": 1610612742,
    "abbreviation": "DAL",
    "teamName": "Dallas Mavericks",
    "simpleName": "Mavericks",
    "location": "Dallas"
}, {
    "teamId": 1610612743,
    "abbreviation": "DEN",
    "teamName": "Denver Nuggets",
    "simpleName": "Nuggets",
    "location": "Denver"
}, {
    "teamId": 1610612765,
    "abbreviation": "DET",
    "teamName": "Detroit Pistons",
    "simpleName": "Pistons",
    "location": "Detroit"
}, {
    "teamId": 1610612744,
    "abbreviation": "GSW",
    "teamName": "Golden State Warriors",
    "simpleName": "Warriors",
    "location": "Golden State"
}, {
    "teamId": 1610612745,
    "abbreviation": "HOU",
    "teamName": "Houston Rockets",
    "simpleName": "Rockets",
    "location": "Houston"
}, {
    "teamId": 1610612754,
    "abbreviation": "IND",
    "teamName": "Indiana Pacers",
    "simpleName": "Pacers",
    "location": "Indiana"
}, {
    "teamId": 1610612746,
    "abbreviation": "LAC",
    "teamName": "Los Angeles Clippers",
    "simpleName": "Clippers",
    "location": "Los Angeles"
}, {
    "teamId": 1610612747,
    "abbreviation": "LAL",
    "teamName": "Los Angeles Lakers",
    "simpleName": "Lakers",
    "location": "Los Angeles"
}, {
    "teamId": 1610612763,
    "abbreviation": "MEM",
    "teamName": "Memphis Grizzlies",
    "simpleName": "Grizzlies",
    "location": "Memphis"
}, {
    "teamId": 1610612748,
    "abbreviation": "MIA",
    "teamName": "Miami Heat",
    "simpleName": "Heat",
    "location": "Miami"
}, {
    "teamId": 1610612749,
    "abbreviation": "MIL",
    "teamName": "Milwaukee Bucks",
    "simpleName": "Bucks",
    "location": "Milwaukee"
}, {
    "teamId": 1610612750,
    "abbreviation": "MIN",
    "teamName": "Minnesota Timberwolves",
    "simpleName": "Timberwolves",
    "location": "Minnesota"
}, {
    "teamId": 1610612740,
    "abbreviation": "NOP",
    "teamName": "New Orleans Pelicans",
    "simpleName": "Pelicans",
    "location": "New Orleans"
}, {
    "teamId": 1610612752,
    "abbreviation": "NYK",
    "teamName": "New York Knicks",
    "simpleName": "Knicks",
    "location": "New York"
}, {
    "teamId": 1610612760,
    "abbreviation": "OKC",
    "teamName": "Oklahoma City Thunder",
    "simpleName": "Thunder",
    "location": "Oklahoma City"
}, {
    "teamId": 1610612753,
    "abbreviation": "ORL",
    "teamName": "Orlando Magic",
    "simpleName": "Magic",
    "location": "Orlando"
}, {
    "teamId": 1610612755,
    "abbreviation": "PHI",
    "teamName": "Philadelphia 76ers",
    "simpleName": "76ers",
    "location": "Philadelphia"
}, {
    "teamId": 1610612756,
    "abbreviation": "PHX",
    "teamName": "Phoenix Suns",
    "simpleName": "Suns",
    "location": "Phoenix"
}, {
    "teamId": 1610612757,
    "abbreviation": "POR",
    "teamName": "Portland Trail Blazers",
    "simpleName": "Trail Blazers",
    "location": "Portland"
}, {
    "teamId": 1610612758,
    "abbreviation": "SAC",
    "teamName": "Sacramento Kings",
    "simpleName": "Kings",
    "location": "Sacramento"
}, {
    "teamId": 1610612759,
    "abbreviation": "SAS",
    "teamName": "San Antonio Spurs",
    "simpleName": "Spurs",
    "location": "San Antonio"
}, {
    "teamId": 1610612761,
    "abbreviation": "TOR",
    "teamName": "Toronto Raptors",
    "simpleName": "Raptors",
    "location": "Toronto"
}, {
    "teamId": 1610612762,
    "abbreviation": "UTA",
    "teamName": "Utah Jazz",
    "simpleName": "Jazz",
    "location": "Utah"
}, {
    "teamId": 1610612764,
    "abbreviation": "WAS",
    "teamName": "Washington Wizards",
    "simpleName": "Wizards",
    "location": "Washington"
}];

exports.teams = teams;

},{}]},{},[5]);
