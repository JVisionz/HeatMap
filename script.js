let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

let baseTemp;
let values = [];

let xScale, yScale;
let minYear, maxYear, numberOfYears;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select('#canvas')
    .attr('width', width)
    .attr('height', height);

let tooltip = d3.select('#tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', '#333')
    .style('color', 'white')
    .style('padding', '8px')
    .style('border-radius', '4px');

let monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

let generateScales = () => {
    minYear = d3.min(values, item => item.year);
    maxYear = d3.max(values, item => item.year);
    numberOfYears = maxYear - minYear;

    xScale = d3.scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - padding]);

    yScale = d3.scaleTime()
        .domain([new Date(0, 0), new Date(0, 11)]) // Months are 0-based in JS
        .range([padding, height - padding]);
};

let drawCells = () => {
    canvas.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', item => {
            let variance = item.variance;
            if (variance <= -1) return 'SteelBlue';
            if (variance <= 0) return 'LightSteelBlue';
            if (variance <= 1) return 'Orange';
            return 'Crimson';
        })
        .attr('data-year', item => item.year)
        .attr('data-month', item => item.month - 1)
        .attr('data-temp', item => baseTemp + item.variance)
        .attr('height', (height - (2 * padding)) / 12)
        .attr('y', item => yScale(new Date(0, item.month - 1)))
        .attr('width', (width - (2 * padding)) / numberOfYears)
        .attr('x', item => xScale(item.year))
        .on('mouseover', function (event, item) {
            tooltip.transition().style('visibility', 'visible');

            tooltip.html(`${item.year} ${monthNames[item.month - 1]}<br>
                Temp: ${(baseTemp + item.variance).toFixed(2)}°C<br>
                Variance: ${item.variance.toFixed(2)}°C`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 30) + 'px')
                .attr('data-year', item.year);
        })
        .on('mouseout', () => tooltip.transition().style('visibility', 'hidden'));
};

let drawAxes = () => {
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));

    canvas.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`);

    canvas.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);
};

req.open('GET', url, true);
req.onload = () => {
    let object = JSON.parse(req.responseText);
    baseTemp = object.baseTemperature;
    values = object.monthlyVariance;
    
    generateScales();
    drawCells();
    drawAxes();
};
req.send();
