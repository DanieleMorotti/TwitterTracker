var map = null;
var search_area = null;
//Function provided by Google to initialize the map associated to the div w/ id="map"
function initMap() {

    var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 41.885453, lng: 12.498221 },
        zoom: 5,
    });
    //Setup EventListener
    setUpClickListener();
}
//Event listener for clicks on that writes coordinates in the coresponding field
function setUpClickListener() {
    map.addListener("click", (mapsMouseEvent) => {
        getCoordinatesOnCLick(mapsMouseEvent);
    });
}
// Draw Searched area on the map

function drawSearchAreaOnMap(loc, r, color) {
    //initialized the radius of the circle and the center
    let radius = 1000 * r;// parseInt(loc.split(',')[2].slice(0, -2));
    let center = { lat: parseFloat(loc.split(',')[0]), lng: parseFloat(loc.split(',')[1]) };

    // Remove previous circle if exists
    if (search_area) {
        search_area.setMap(null);
    }
    // Add the circle for this city to the map.
    search_area = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map,
        center: center,
        radius: radius,
    });
    search_area.addListener("click", (mapsMouseEvent) => {
        getCoordinatesOnCLick(mapsMouseEvent);
    });
}

function getCoordinatesOnCLick(mapsMouseEvent) {
    $('#coordinates').val(mapsMouseEvent.latLng.lat().toFixed(2) + ', ' + mapsMouseEvent.latLng.lng().toFixed(2));
    drawSearchAreaOnMap($('#coordinates').val(), $('#radius').val(), '#FF0000');
}
// Event associated on change of coordinates to draw the area
$(document).on('input', '#coordinates', function () {
    let coordinates = $('#coordinates').val();
    if (!isNaN(coordinates.split(',')[1])) {
        drawSearchAreaOnMap($('#coordinates').val(), $('#radius').val(), '#FF0000');
    }
});

function test(valore) {
const request = {
    query: "Museum of Contemporary Art Australia",
    fields: ["name", "geometry"],
  };
  service = new google.maps.places.PlacesService(map);
  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        valore = results[0].name;
    }
  });
}

$(document).on('ready', () => {
    initMap();
});
