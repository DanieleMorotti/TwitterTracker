
export default {
    name: 'map_view',
    template: `
        <div>
          <h3>Here you will find the geographical representation of the results of your research</h3>
          <div id="data-view-map"></div>
        </div>
    `,
    methods: {
        expandTweet(id) {
            console.log(id);
        },
        drawDataOnMapView(map) {
            lastTweetsList.forEach(tweet => {
                //For each tweet we pick one of the <x,y> points that represents
                //the bounding box of coordinates and make a marker to display on the map for it
                let LatLng = { lat: Number(tweet.coordinates[0][0][1]), lng: Number(tweet.coordinates[0][0][0]) };
                let marker = new google.maps.Marker({
                    position: LatLng,
                    map
                });

                //Add a listener on the click on marker event
                marker.addListener("click", () => { this.expandTweet(tweet.id); });

                //If there is at least one image we use that one as the marker 
                if (tweet.images.length > 0) {
                    let url = tweet.images[0];
                    let img = new Image();
                    img.src = url;

                    //We create an Image object and wait for it to load
                    //after that the width to be used is calculated on a height of 60px
                    img.onload = function () {
                        let height = img.height;
                        let width = img.width;
                        let new_width = (40 * width) / height;
                        let image = {
                            url: url,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 0),
                            scaledSize: new google.maps.Size(new_width, 40)
                        };
                        //And set the resulting image as Icon
                        marker.setIcon(image);
                    }
                }
            });
        }
    },
    activated() {
        var center = (searchObj && searchObj.center) ? searchObj.center : '41.885453,12.498221';
        var data_map = new google.maps.Map(document.getElementById("data-view-map"), {
            center: { lat: Number(center.split(',')[0]), lng: Number(center.split(',')[1]) },
            zoom: 5,
        });
        if (lastTweetsList) { this.drawDataOnMapView(data_map); }
	}
}