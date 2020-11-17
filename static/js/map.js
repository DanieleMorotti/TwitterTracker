var map = null;
var search_area = null;
//saving the last shape i drew, so when I draw a new shape I remove the previous one
let shape = null;
//Function provided by Google to initialize the map associated to the div w/ id="map"
function initMap() {

    //TODO:serve questa variabile? var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 41.885453, lng: 12.498221 },
        zoom: 5,
    });

    //set up the drawing tool
    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            //set the position of the tool and the shapes you can draw
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.CIRCLE
            ],
        },
        circleOptions: {
            fillColor: "red",
            fillOpacity: 0.3,
            strokeWeight: 2,
            clickable: false,
            editable: true,
            zIndex: 1,
        },
    });
    drawingManager.setMap(map);


    //after the end of the draw action
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        //delete the previous shape drawn by the user and save the new one
        if(shape)shape.setMap(null);
        shape = event.overlay;
        //delete the circle drawn automatically from the function @drawSearchAreaOnMap
        if(search_area)search_area.setMap(null);

        if (event.type == 'circle') {
            //to remove the parenthesis from the coordinates string
            let center = shape.getCenter().toString().replace(/[\(\)]/g,'');
            let radius = shape.getRadius();
            
            $('#coordinates').val(center);
            //because the range is in km, but the radius is in m
            $('#radius').val(parseInt(radius/1000));

            //if the radius > 1000km i set to 1000km
            if(radius > 1000000) shape.setRadius(1000000);
        }

        /*The shape can be moved or resized, added eventlisteners to manage this actions*/
        setEventListeners(shape,'radius_changed','center_changed');
    });
}

// Draw Searched area on the map
function drawSearchAreaOnMap(loc, r, color) {
    //delete the circle drawn by the user
    if(shape) shape.setMap(null);

    //initialized the radius of the circle and the center
    let radius = 1000 * r;// parseInt(loc.split(',')[2].slice(0, -2));
    let center = { lat: parseFloat(loc.split(',')[0]), lng: parseFloat(loc.split(',')[1]) };

    // Remove previous circle if exists
    if (search_area) {
        search_area.setMap(null);
    }
    // Add the circle for these coordinates to the map.
    search_area = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map,
        center: center,
        radius: radius,
        editable:true
    });
    
    /*The shape can be moved or resized, added eventlisteners to manage this actions*/
    setEventListeners(search_area,'radius_changed','center_changed');
}

//set event listeners for event1,event2 on element el
function setEventListeners(el,event1,event2){
    el.addListener(event1, function(e) {
        let newRadius = el.getRadius();
        $('#radius').val(parseInt(newRadius/1000));

        //if the radius > 1000km i set to 1000km
        if(newRadius > 1000000) el.setRadius(1000000);
    });

    el.addListener(event2, function(e){
        let newCenter = el.getCenter().toString().replace(/[\(\)]/g,'');
        $('#coordinates').val(newCenter);
    });

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
