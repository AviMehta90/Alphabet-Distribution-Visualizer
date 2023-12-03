function submitText() {
    const enteredText = document.getElementById('wordbox').value.toLowerCase();
    processText(enteredText);
}


function processText(text) {

    const vowelRegex = /[aeiouy]/g;
    const consonantRegex = /[bcdfghjklmnpqrstvwxyz]/g;
    const punctuationRegex = /[.,?!:;]/g;

    const vowelCount = (text.match(vowelRegex) || []).length;

    if (vowelCount > 0){
        var actVowels = text.match(vowelRegex).sort().reduce((arr, x) => {
            arr[x] = arr[x] ? arr[x] + 1 : 1;
            return arr;
          }, {});
    }
    
    const consonantCount = (text.match(consonantRegex) || []).length;
    if (consonantCount > 0){
        var actConsonants = text.match(consonantRegex).sort().reduce((arr, x) => {
            arr[x] = arr[x] ? arr[x] + 1 : 1;
            return arr;
          }, {});
    }
    
    const punctuationCount = (text.match(punctuationRegex) || []).length;
    if (punctuationCount > 0){
        var actPunctuations = text.match(punctuationRegex).sort().reduce((arr, x) => {
            arr[x] = arr[x] ? arr[x] + 1 : 1;
            return arr;
          }, {});
    }

    createDonutChart(vowelCount, consonantCount, punctuationCount, actVowels, actConsonants, actPunctuations);
}


function createDonutChart(vowelCount, consonantCount, punctuationCount, actVowels, actConsonants, actPunctuations) {

    var allConsolants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n','p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z']
    var allVowels = ['a', 'e', 'i', 'o', 'u', 'y']
    var allPunctuations = ['.', ',', '?', '!', ':', ';']

    const data = [
        { label: 'Vowels', count: vowelCount },
        { label: 'Consonants', count: consonantCount },
        { label: 'Punctuation', count: punctuationCount },
    ];

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal().domain(data.map(d => d.label)).range(d3.schemeSet3);

    const svg = d3.select('#pie_svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width}, ${height/1.5})`);

    const pie = d3.pie().value(d => d.count);

    const arcs = pie(data);

    const path = svg.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius)
        )
        .attr('fill', d => color(d.data.label))
        .attr('stroke', 'black')
        .attr('stroke-width', 1); 

    const countText = svg.append('text')
        .attr('class', 'count-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em');

    path.on('mouseover', function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke-width', 4);
        countText.transition()
        .duration(250).text(d.srcElement.__data__.data.label.toLowerCase() + ": "+d.srcElement.__data__.data.count);
        countText.attr('x', 0).attr('y', 0);
    }).on('mouseout', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke-width', 1);
        countText.transition()
        .duration(250).text('');
        countText.attr('x', -1000).attr('y', -1000);
    }).on('click', function(d) {
        const characterType = d.srcElement.__data__.data.label;
        if (characterType == 'Vowels'){
            var characterTypeData = actVowels;
            var allChars = allVowels;
        } else if (characterType == 'Consonants'){
            var characterTypeData = actConsonants;
            var allChars = allConsolants;
        } else if (characterType == 'Punctuation'){ 
            var characterTypeData = actPunctuations;
            var allChars = allPunctuations;
        }
        createBarChart(allChars, characterTypeData, color(d.srcElement.__data__.data.label));
    });
    
}


function createBarChart(ls, characterTypeData, c) {

    d3.select('#bar_svg').selectAll('*').remove();

    const barWidth = 450;
    const barHeight = 300;

    const barSvg = d3.select('#bar_svg')
        .attr('width', barWidth)
        .attr('height', barHeight);
    
    var x = d3.scaleBand()
                .range([0, barWidth])
                .domain(ls);
    var y = d3.scaleLinear()
                .range([0, barHeight])
                .domain([d3.max(Object.values(characterTypeData)), 0]);

    const gx = barSvg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(50, ${barWidth-110})`)
        .call(d3.axisBottom(x));
    
    const gy = barSvg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(50, 40)`)
        .call(d3.axisLeft(y));

    var tooltip = d3.select("#tooltip_div");

    var character = d3.select("#character-name");

    const characterList = Object.keys(characterTypeData);

    barSvg.selectAll(".chars")
        .data(characterList)
        .join("rect")
        .attr("class", "chars")
        .attr("x", function(d) { return x(d); })
        .attr("y", function(d) { return y(characterTypeData[d]); })
        .attr("width", x.bandwidth()-5)
        .attr("height", function(d) { return barHeight - y(characterTypeData[d]); })
        .attr("fill", c)
        .attr("transform", `translate(53, 40)`)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .on('mouseover', function(e, d) {
            character.html(characterTypeData[d]);
            tooltip.html(`Character: ${d}<br>Count: ${characterTypeData[d]}`)
                .style("opacity", 1)
                .style("left", (e.clientX+5)+'px')
                .style("top", (e.clientY+10)+'px');
        })
        .on('mousemove', function(e, d) {
            tooltip.html(`Character: ${d}<br>Count: ${characterTypeData[d]}`)
                .style("opacity", 1)
                .style("left", (e.clientX+5)+'px')
                .style("top", (e.clientY+10)+'px');
        })
        .on('mouseout', function (e, d) {
            character.html('NONE');
            tooltip.style("opacity", 0);
        });

}