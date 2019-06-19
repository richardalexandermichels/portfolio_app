import { teams } from './teams.js'
import { loadChart, nbaChartChange } from './d3NbaStats.js'
// import * as d3 from 'd3'

function addNbaHandles() {

    let teamSelect = document.getElementById('teamSelect');
    let cbox = document.getElementById('realAllTeamsBox')
    let sortSelect = document.getElementById('sortSelect')
    teams.forEach(ele => {
        let opt = document.createElement('option');
        opt.value = ele.teamId;
        opt.innerHTML = ele.teamName;
        teamSelect.append(opt);
    })
    teamSelect.value = '1610612756'
    teamSelect.onchange = function (e) {
        nbaChartChange(!cbox.checked)

    }
    sortSelect.onchange = function (e) {
        nbaChartChange(!cbox.checked)
    }
    cbox.onchange = function (e) {
        teamSelect.disabled = !teamSelect.disabled
        nbaChartChange(!teamSelect.disabled, true)
        // d3.selectAll("path").transition()
        //     .delay(function (d, i) { return ((!teamSelect.disabled) ? 2 : 50) * i; })
        //     .duration(500)
        //     .attrTween("d", function (d) { return arcTweenReverse(d) })
        // d3.select("svg").transition()
        //     .duration(!teamSelect.disabled ? 1200 : 1000)
        //     .remove()
        //     .on("end", () => loadChart(teamSelect.disabled, sortSelect.value));
    }
    loadChart(false, sortSelect.value);
}


addNbaHandles();