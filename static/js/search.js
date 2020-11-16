
export default {
    name: 'search',
    data() {
        return{
            value: 100
        }
    }, 
    template: `
    <div id="filterComp">
        <div id="inputFields">
            <label for="keyWord">key-word: </label>
            <input type="text" name="keyWord" id="keyWord" />
            <br> 
            <label for="user">user: </label>
            <input type="text" name="user" id="user" />
            <br>

            <label for="pdi">point of interest: </label>
            <input type="text" name="pdi" id="pdi" placeholder="e.g. Università di Bologna" size="22" /> <br>
            
            <div id="map"></div>
            <label for="coordinates">coordinates (lat, long): </label>
            <input type="text" name="coordinates" id="coordinates" placeholder="e.g. 45.4773,9.1815" size="22" @keyup.enter="changeArea"/> <br>
            <label for="radius">radius: </label>
            <input style="display:inline" id="radius" type="range" min="10" max="1000" step="10"  v-model="value" name="radius" @click="changeArea"/>
            <label style="display:inline"><span v-text="value" id="radiusValue"></span> km</label>
            <br>
            
            <input type="checkbox" id="images-only">            
            <label for="images-only">Show only tweets containing images</label>
            <br>
            
            <button @click="save()">SEARCH</button>
        </div>
    </div>
    `,
    methods: {
        changeArea() {
            let center = $('#coordinates').val();
            let radius = this.value;
            if (center && radius)
                drawSearchAreaOnMap(center, radius, '#00FF00'); 
        }
    },
    activated() {
        initMap();
        if(!autocompleteInitialized) {
            initAutocomplete();
            autocompleteInitialized = true;
        }
    }
}