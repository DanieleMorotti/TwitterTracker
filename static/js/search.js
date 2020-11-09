
export default {
    name: 'search',
    data() {
        return{
            value: 50
        }
    }, 
    template: `
    <div id="filterComp">
        <div id="inputFields">
            <label for="kewyWord">key-word: </label>
            <input type="text" name="keyWord" id="keyWord" />
            <br> 
            <label for="user">user: </label>
            <input type="text" name="user" id="user" />
            <br>
            
            <label for="coordinates">coordinates (lat, long): </label>
            <input type="text" name="coordinates" id="coordinates" placeholder="e.g. 45.4773,9.1815" size="22" />
            
            <label for="ray">ray:</label>
            <input id="ray" type="range" min="10" max="1000" step="10"  v-model="value" name="ray"/>
            <p><span v-text="value" id="rayValue">km</span> km</p>

            <br>
            <button> Draw your area</button><br>
            <select name="regions" id="regions">
            <option value="reg">regione</option>
            </select><br>
            <button @click="save()">SEARCH</button>
        </div>
    </div>
    `,
    methods: {
       
    }
}