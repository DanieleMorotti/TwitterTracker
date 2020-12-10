
export default {
    name: 'main',
    template: `
        <div>
            <div class="main-container">
                <div class="main-title-container">
                    <h2>Fraydrum</h2>   
                    <h5>Raccogli e analizza tweet</h5>
                    <button @click="$('#toSearch').click();">Inizia</button>
                </div>
                <div class="lined-header-container">  
                    <div class="lined-header">Raccolta e analisi</div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/map_icon.png" alt="icona mappa">
                            <div class="title">Mappe</div>
                            <div class="description">Visualizza i tweet raccolti sulla mappa</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/cloud_icon.png" alt="icona word-cloud">
                            <div class="title">Word-cloud</div>
                            <div class="description">Disposizione delle parole in forma di word-cloud</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-container center-block text-center">
                            <img src="/static/img/chart_icon.png" alt="icona grafici">
                            <div class="title">Grafici</div>
                            <div class="description">Visualizzazione grafica delle parole ricorrenti</div>
                        </div>
                    </div>
                </div>

                <div class="lined-header-container">  
                    <div class="lined-header">Condivisione</div>
                </div>
                <div class="row">
                <div class="col-md-12">
                    <div class="dashboard-container center-block text-center">
                        <img src="/static/img/share_icon.png" alt="icona condivisione">
                        <div class="title">Condivi</div>
                        <div class="description">Condividi i dati raccolti su Twitter</div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `
}