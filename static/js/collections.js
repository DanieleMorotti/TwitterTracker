export default {
    name: 'collections',
    template: `
        <div>
            <h3>Tweet Collections</h3>
            <div id="collections"></div>
        </div>
    `,

    methods: {
        
    },

    activated() {
        loadCollections();
    }
}