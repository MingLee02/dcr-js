$(document).ready(function() {
    let graphDataX = [];
    let graphDataY = [];
    let textArray = [];
    let itemSize = [];

    const fetchCountryData = function(userChoice) {
        fetch('./data/countries.json').then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        }).then(json => {
            createUserOutput(json, userChoice);
        }).catch(function () {
            this.dataError = true;
        });
    };

    const clearGraphDataLists = function() {
        graphDataX = [];
        graphDataY = [];
        textArray = [];
        itemSize = [];
    }

    const createCountryTable = function(tableRows, userChoice) {
        clearGraphDataLists();

        tableRows.forEach(function(item) {
            let dynamicValue = item[userChoice.attr('value')];
        
            if (Array.isArray(dynamicValue)) {
                dynamicValue = dynamicValue.length;
            }
            $('.countryTableBody').append(
                '<tr>' +
                '<td>' + item.name + '</td>' +
                '<td>' + dynamicValue + '</td>' +
                '<td>' + item.region + '</td>' +
                '<td>' + item.capital + '</td>' +
                '</tr>' 
            );
           
            graphDataX.push(item.latlng[0]);
            graphDataY.push(item.latlng[1]);
            textArray.push(item.name + '<br>' + dynamicValue);
            itemSize.push(60);
        });
    }

    const createRegionTableWithCountryCount = function (regions) {
        clearGraphDataLists();
        let count = 1;
        $.each(regions, function(key, obj) {
            $('.regionTableBody').append(
                '<tr>' +
                '<td>' + key + '</td>' +
                '<td>' + obj.length + '</td>' +
                '</tr>' 
            );
            graphDataX.push(count);
            graphDataY.push(count + 10);
            textArray.push(key + '<br>' + obj.length);
            itemSize.push(60);
            count = count + 1
        });
    }

    const createRegionTableWithUniqueTimezoneCount = function (regions) {
        clearGraphDataLists();
        let count = 1;
        $.each(regions, function(key, obj) {
            let timezones = obj.map(function (el) { return el.timezones; });
            let timezonesFlat = [].concat.apply([], timezones);
            let uniqueTimezones = [...new Set(timezonesFlat)];
            $('.regionTableBody').append(
                '<tr>' +
                '<td>' + key + '</td>' +
                '<td>' + uniqueTimezones.length + '</td>' +
                '</tr>' 
            );
            graphDataX.push(count);
            graphDataY.push(count + 10);
            textArray.push(key + '<br>' + uniqueTimezones.length);
            itemSize.push(60);
            count = count + 1 
        });
    }

    const createGraph = function (title) {
        let data = [{
            x: graphDataX,
            y: graphDataY,
            text: textArray,
            mode: 'markers+text',
            marker: {
                size: itemSize
            }
        }];
          
        let layout = {
            title: title,
            showlegend: false
        };
          
        Plotly.newPlot('graph', data, layout);
    }

    const groupBy = function(objectArray, property) {
        return objectArray.reduce((acc, obj) => {
           const key = obj[property];
           if (!acc[key]) {
              acc[key] = [];
           }
           // Add object to list for given key's value
           acc[key].push(obj);
           return acc;
        }, {});
    }

    const createUserOutput = function(data, userChoice) {
        if (userChoice.parent().attr('id') == 'country-select') {
            $('.countryTableBody').empty(); // Remove previous values
            $('#countryTable').removeClass('d-none'); // Show table
            $('.userSelectedOption').text(userChoice.text()); // Update table header

            createCountryTable(data, userChoice);
            createGraph(userChoice.text());
        } else {
            const regions = groupBy(data, 'region');
            $('.regionTableBody').empty();
            $('#RegionTable').removeClass('d-none');
            $('.userSelectedOption').text(userChoice.text());

            if ('Number of countries' == userChoice.text()) {
                createRegionTableWithCountryCount(regions);
            } else {
                createRegionTableWithUniqueTimezoneCount(regions);
            }
            
            createGraph(userChoice.text());
        }
    }

    $("#form").submit(function(event) {
        event.preventDefault();
        let GraphByCountry = $('#country-select').find(":selected");
        let GraphByRegion = $('#region-select').find(":selected");

        if (GraphByCountry && GraphByCountry.text()) {
            $('#RegionTable').addClass('d-none');
            fetchCountryData(GraphByCountry);
        }
        if (GraphByRegion && GraphByRegion.text()) {
            $('#countryTable').addClass('d-none');
            fetchCountryData(GraphByRegion);
        }
    });

    $('#country-select').change(function() {
        // On country select remove region option
        $("#region-select").val(1);
    });
    $('#region-select').change(function() {
        // On region select remove country option
        $("#country-select").val(1);
    });
});