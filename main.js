(function () {

    let DATA_URL = "https://opensky-network.org/api/states/all";

    // create map in leaflet and tie it to the div called 'theMap'
    var map = L.map('theMap').setView([43, -89], 4);

    // load a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Data by <a href="https://opensky-network.org">OpenSky</a>, Icons by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>'
    }).addTo(map);

    var planeIcon = L.icon({
        iconUrl: 'airplane.png',
        iconSize: [50, 50], // size of the icon
    });

    var markers = null;
    var ctr = 0;
    let fetchData = async () => {
        // fetch real-time transit data
        fetch(DATA_URL)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {

                let geojsonFeatureCA = myJson.states
                    // filter data to keep those aircraft whose country of origin is Canada
                    .filter((flight) => flight[2] === 'Canada')
                    // convert filtered data to GeoJSON format
                    .map((flight) => {
                        // console.log(flight);
                        return {
                            type: "Feature",
                            properties: {
                                callsign: flight[1],
                                baro_altitude: flight[7],
                                on_ground: flight[8],
                                velocity: flight[9],
                                true_track: flight[10],
                                vertical_rate: flight[11],
                                geo_altitude: flight[13],
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [flight[5], flight[6]]
                            }

                        }
                    });
                // console.log(geojsonFeatureCA);
                if (markers !== null) {
                    markers.clearLayers();
                    markers = null;
                    ctr = 0;
                }
                //  plot the markers on the map
                markers = L.geoJSON(geojsonFeatureCA, {
                    pointToLayer: function (feature, latlng) {
                        var marker = L.marker(latlng, { icon: planeIcon, rotationAngle: feature.properties.true_track });
                        marker.bindPopup('Call Sign: ' + feature.properties.callsign + '<br/>' +
                            'Baro Altitude: ' + feature.properties.baro_altitude + '<br/>' +
                            'On Ground: ' + feature.properties.on_ground + '<br/>' +
                            'Velocity: ' + feature.properties.velocity + '<br/>' +
                            'True Track: ' + feature.properties.true_track + '<br/>' +
                            'Vertical Rate: ' + feature.properties.vertical_rate + '<br/>' +
                            'Geo Altitude: ' + feature.properties.geo_altitude + '<br/>');
                        ctr++;
                        return marker;
                    }
                }).addTo(map);
                // console.log('total: ' + ctr);
            });
    };



    setInterval(fetchData, 10000);

})();