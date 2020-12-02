/*
import {loadCollections, openCollection, deleteCollection, updateCollectionName} from './collections.js'

export default {
    name: 'collections',
    template: `
        <div>
            <h3>Tweet Collections</h3>
            <div id="collections"></div>
        </div>
    `,

    methods: {
        // Display an array of collections in the collections area
        setCollections(data) {
            $("#collections").empty();
            for(let i = 0; i < data.length; i++)
            {
                let c = data[i];
                let date = c.date || "";
                let div = $(`
                <div class="collection">
                    <input type="text" class="collection-name" value="${c.name}">
                    <p class="collection-count">Count: ${c.count}</p>
                    <p class="collection-date">${date}</p>
                    <button class="collection-open">Open</button>
                    <button class="collection-delete">Delete</button>
                </div>
                `);

                div.find('.collection-name').on("change", (e) => updateCollectionName(c.id, $(e.target).val()));
                div.find(".collection-open").on("click", () => openCollection(c.id));
                div.find(".collection-delete").on("click", () => deleteCollection(c.id));

                $("#collections").append(div);
            }
        }
    },

    activated() {
        loadCollections();
    }
}

*/