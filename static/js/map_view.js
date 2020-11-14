
export default {
    name: 'map_view',
    template: `
        <div>
          <h3>Here you will find the geographical representation of the results of your research</h3>
          <div id="data-view-map"></div>
        </div>
    `,
    methods: {
        drawDataOnMapView() {
            lastTweetsList.forEach(tweet => {
                //console.log('location: ' + tweet.location + '\ngeo: ' + tweet.geo_enabled + '\ncoords: '+ tweet.coordinates);
                console.log(tweet.images);
            });
        }
    },
    activated() {
        //TODO: Copy pasted code, abstraction needed
        var center = (searchObj && searchObj.center) ? searchObj.center : '41.885453,12.498221';
        var geocoder = new google.maps.Geocoder();
        var data_map = new google.maps.Map(document.getElementById("data-view-map"), {
            center: { lat: Number(center.split(',')[0]), lng: Number(center.split(',')[1]) },
            zoom: 5,
        });
        if (lastTweetsList) { this.drawDataOnMapView(); }
	}
}