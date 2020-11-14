
export default {
    name: 'search',
    template: `
        <div>
            <button id="saveBtn" @click="newSearch()">Search</button>
            <div id="tweets-search" style="max-height: 90vh;overflow-y: auto;">
            </div>
        </div>
    `
}