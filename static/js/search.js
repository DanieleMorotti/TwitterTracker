
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
            
            <button id="mapBtn" data-toggle="modal" data-target="#mapModal"> Draw your area</button>  <br>

            <label for="coordinates">coordinates (lat, long): </label>
            <input type="text" name="coordinates" id="coordinates" placeholder="e.g. 45.4773,9.1815" size="22" /> <br>
            <label for="ray">ray: </label>
            <input style="display:inline" id="ray" type="range" min="10" max="1000" step="10"  v-model="value" name="ray"/>
            <label style="display:inline"><span v-text="value" id="rayValue"></span> km</label>
            <br>
            
            <input type="checkbox" id="images-only">            
            <label for="images-only">Show only tweets containing images</label>
            <br>
            
            <button @click="save()">SEARCH</button>
        </div>
    </div>
    `,
    activated() {
        if(!autocompleteInitialized) {
            initAutocomplete();
            autocompleteInitialized = true;
        }
        $(document).on('click','#mapBtn', () =>{
                let center = $('#coordinates').val();
                let ray = $('#ray').val();
                if (center && ray)
                    drawSearchAreaOnMap(center,ray, '#00FF00'); 
        });
    }
}