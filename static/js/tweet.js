
export default {
    name: 'search',
    template: `
        <div>
            <button id="saveBtn" @click="newSearch()">Search</button>
            <button id="save-collection" @click="saveCollection()">Save</button>
            <div id="results"></div>
            <div id="filters"></div>
            <div id="tweets-search" style="">
            </div>
        </div>
    `
}