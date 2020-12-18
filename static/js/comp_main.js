
export default {
    name: 'main',
    template: `
        <div>
            <div class="main-container">
                <div class="main-title-container">
                <header>
                    <h1>Twitter-Tracker</h1>   
                    <h4>Collect and analyze data</h4>
                    <button @click="$('#toSearch').click();">Start</button>
                </header>
                </div>
                <div class="lined-header-container">  
                    <div class="lined-header">Collection and Analysis</div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/map_icon.png" alt="icona mappa">
                            <div class="title">Map</div>
                            <div class="description">View on the map the collected tweets</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/cloud_icon.png" alt="icona word-cloud">
                            <div class="title">Word-cloud</div>
                            <div class="description">Arrangement of words in the form of Word-Cloud</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/chart_icon.png" alt="icona grafici">
                            <div class="title">Graphics</div>
                            <div class="description">Graphic display of recurring words</div>
                        </div>
                    </div>
                </div>

                <div class="lined-header-container">  
                    <div class="lined-header">User section</div>
                </div>
                <div class="row">
                <div class="col-md-12">
                    <div class="dashboard-container center-block text-center">
                        <img src="/static/img/save_icon.png" alt="icona salva">
                        <div class="title">Save</div>
                        <div class="description">Save, review and update your collections</div>
                    </div>
                </div>
                <div class="col-md-12">
                    <div class="dashboard-container center-block text-center">
                        <img src="/static/img/share_icon.png" alt="icona condivisione">
                        <div class="title">Share</div>
                        <div class="description">Share collected data on Twitter</div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `
}