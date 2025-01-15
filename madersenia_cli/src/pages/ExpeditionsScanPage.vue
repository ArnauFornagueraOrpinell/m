<template>
    <q-page style="margin: 10px;">
        <q-dialog v-model="mostrarDialogoOf">
            <q-card>
                <q-card-section class="row items-center">
                <q-icon name="warning" color="red" />
                <span class="q-ml-sm">Selecciona una orden de fabricación antes de continuar</span>
                </q-card-section>
                <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
            <q-dialog v-model="mostrarBarcodeAlreadyReaded">
            <q-card>
                <q-card-section class="row items-center">
                <q-icon name="warning" color="red" />
                <span class="q-ml-sm">El codigo de barras ya se ha leido previamente</span>
                </q-card-section>
                <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <div v-show="new_order" class="overlay"></div>
        <!-- <q-btn @click="showForm = true; scanning=false; new_order = !new_order; ofDialog()" label="NUEVO PALET"  />  -->
        <!-- <q-btn @click="scanBarcode" label="Escanear Código de Barras" style="margin: 0px 10px 0px 10px;" /> -->
        <div v-show="!scanning" style="display: flex; justify-content: center; align-items: center; padding-top: 10px;">
            <!-- <q-label for="selected_of.name" style="margin: 0px 10px 0px 10px;">Selecciona una orden de fabricación</q-label> -->
            <!-- OFS format: [
                "of1",
                "of2"
                ]
                -->
                  
            <multiselect v-model="selected_of" :options="ofs" placeholder="Selecciona una OF" label="name" track-by="name" style="width:200px"></multiselect>
        </div>
        <br>
        <div style="display: flex; justify-content: center;">
            <q-input v-show="scanning" v-model="selected_barcode" label="Codigo de Barras" style="width: 200px;" filled type="text" />
        </div>
        <!--    <video id="webcam_viewport" style="width: 250px; height: 250px;"></video> -->
        <section v-show="scanning" id="container" class="container">
            <div v-show="scanning" id="result_strip">
                <ul class="thumbnails"></ul>
                <ul class="collector"></ul>
            </div>
            <div v-show="scanning" id="interactive" class="viewport"></div>
        </section>
        
        <div v-show="!scanning" style="margin-top: 10px;" >
            <q-card  class="kanban-card" style="margin: 10px 0px 10px 0px; height:70px; background-color: #AC162C; cursor: pointer;" @click="ofDialog(); nuevoPalet();">
                <q-card-section >
                    <q-item>
                        <q-item-section style="display: flex; justify-content: center; align-items: center;">
                            <!-- pon uno al lado del otro  -->
                            <p style="color: white; margin: 0 10px 0 0; font-size: larger;" >NUEVO PALET</p>

                            
                        </q-item-section>
                    </q-item>
                    <q-item>
                        
                    <!-- <q-card v-show="new_order" styçle="width: 40%; margin: 0 auto;"></q-card> -->

                    </q-item>
                </q-card-section>
                
            </q-card>
            <transition
                    name="fade"
                    enter-active-class="animated fadeIn "
                    leave-active-class="animated fadeOut "
                >
                <q-card>
                    <q-card-section v-show="new_order" style="max-width: 400px; margin: 0 auto;" class="overlay">
                        <div >
                            <!-- line 1  -->
                            <div class="input-line">
                                <q-input v-model="form.PRODUCT_ID" label="ID Producto" type="number"  />
                                
                            </div>
                            <div class="input-line">
                                <q-input v-model="form.CODI_PRODUCTE" label="Nombre"  />

                                <q-input v-model="form.NUM_DOC_OF" label="OF" type="number"  />
                            </div>
                            <div class="input-line">
                                <q-input v-model="form.CODI_PRODUCTE" label="Referencia de Pieza"  />
                                <q-input v-model="form.DESCRIPCIO" label="Descripción"  />
                            </div>
                            <!-- line 2 -->
                            <div class="input-line">
                                <q-input v-model="form.ANCHO" label="Ancho" type="number"/>
                                <q-input v-model="form.LARGO" label="Alto" type="number"/>
                                <q-input v-model="form.GRUESO" label="Grosor" type="number"/>
                                <q-input v-model="form.TIPUS_EMBALATGE" label="Tipus Embalatge"  />
                
                            </div>
                            <!-- line 3 -->
                            <div class="input-line">
                                <q-input v-model="form.UBICACIO_1" label="Edificio"  />
                                <q-input v-model="form.UBICACIO_2" label="Planta"  />
                                <q-input v-model="form.UBICACIO_3" label="Habitación"  />
                            </div>
                            <q-btn label="CREAR" style="margin: 10px 0px 10px 0px;"  />
                        </div>
                    </q-card-section>
                </q-card>
            </transition>
    
        </div>
        
        <q-card v-show="!scanning" :id="packing_index" style="margin: 10px 0px 10px 0px;" v-for="(packing, packing_index) in packings" :key="packing_index" @click="togglePalet(packing_index)">

            <q-item>
                    <q-item-section>
                        <q-item-label>
                            <p style="width: 1000px; font-size: large; margin: 10px">{{'PALET #' + (packing_index+1)+'-'+packing.NUM_DOC_OF.toUpperCase()+ (packing.products.length > 0 ? '-' + packing.products[0].UBICACIO_3.toUpperCase() : '')}}</p>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            <q-card-section v-show="!scanning" style="margin: 10px" >
                OF: {{ packing.of_group }}
            </q-card-section>
            <q-card-section @click.stop v-show="!scanning" >
                <q-item v-for="(product, product_index) in packing.products" :key="product_index" >
                    <q-item-section>
                        <ProductComponent 
                            @click.stop @click="toggleSelection(product)" 
                            :id="'#'+product.NUM_DOC_OF+'-'+product.CODI_PRODUCTE" 
                            :class="{ 'product-component': true, 'selected': selection.includes(product) }"
                            v-model="this.packings[packing_index].products[product_index]"
                        />
                        
                    </q-item-section>  
                      
                </q-item>
                <q-card id="index" v-show="selected_palet != null && selected_palet == packing_index" class="kanban-card" style="margin: 10px 0px 10px 0px; height:70px; background-color: #1e90ff ; cursor: pointer; color: white; font-size: larger;" @click="ofDialog(); scanBarcode();">
                    <q-card-section >
                        <q-item>
                            <q-item-section style="display: flex; justify-content: center; align-items: center;">
                                <q-icon name="add" style="cursor: pointer;" />
                            </q-item-section>
                        </q-item>
                    </q-card-section>
                </q-card>
            </q-card-section>
        </q-card>
   
        <h3 v-show="packings.length === 0" style="text-align: center;">No hay una lista de expedición aún</h3>

        <!-- <q-btn v-show="packings.length > 0" @click="confirmOrder" :label="`Confirmar ${packings.length} Palets`"  style="color:white; background-color: green; float: right;"/> -->
        <!-- <div v-show="!showForm" style="height: 72px;"></div> -->
        <!-- the class is the index of the array -->
        <q-card style="margin: 10px 0px 10px 0px;" v-for="(barcode, index) in barcodes_readed" :key="index" @click="selectBarcode(barcode)" >
            <q-card-section v-if="barcodes_readed.length > 0 && scanning" >
                <q-item>
                    <q-item-section>
                        <q-item-label caption>{{ barcode }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-card-section>
        </q-card>
    
        <div v-show=" packings.length > 0 && !scanning" style="background-color: green; color: green; position: fixed; bottom: 0; width: 100%; height: 56px;" >
            <transition 
                name="confirm-slide1"
                enter-active-class="animated slideInLeft"
                leave-active-class="animated faster fadeOut slower slideOutLeft linear"
                >
                <div 
                    v-if="selection.length > 0 && packings.length > 0"
                    @click.stop
                    @click="confirmOrder"
                    :style="{ 
                        backgroundColor: 'green', 
                        color: 'white', 
                        position: 'fixed', 
                        bottom: '0', 
                        right: '0', 
                        width: '50%', 
                        padding: '10px', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        float: 'right',
                        fontSize: 'large',

                    }"        >
                    CONFIRMAR: <b style="font-size: x-large;">{{ palet_selection.length }} </b> PALETS
                </div>
            </transition>
            <transition name="confirm-slide2"
                enter-active-class="animated fadeIn"
            >
                <div v-if="selection.length == 0 && packings.length > 0"
                    @click="confirmOrder"
                    :style="{ 
                    backgroundColor: 'green', 
                        color: 'white', 
                        position: 'fixed', 
                        bottom: '0', 
                        right: '0', 
                        width: '100%', 
                        padding: '10px', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        float: 'right',
                        fontSize: 'large',

                    }"        >
                    CONFIRMAR: <b style="font-size: x-large;">{{ palet_selection.length }} </b> PALETS
                </div> 
            </transition>
            <transition name="delete-slide"
                enter-active-class="animated slideInLeft"
            >
                <div 
                    v-if="selection.length > 0" 
                    @click="deleteOrder" 
                    :style="{ 
                        backgroundColor: 'red',
                        color: 'white', 
                        position: 'fixed', 
                        bottom: '0', 
                        left: '0', 
                        width: '50%', 
                        padding: '10px', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        float: 'left',
                        fontSize: 'large',
                    }"
                    class="grow"
                > 
                    ELIMINAR: <b style="font-size: x-large;">{{ selection.length }} </b> PRODUCTO{{ selection.length > 1 ? 'S' : '' }}
                </div>

            </transition>
        </div>
        <q-btn v-show="selected_barcode !== null && scanning" @click="confirmBarcode" label="Confirmar " style="color:white; background-color: green; float: right; margin 20px;"/>
        <div style="margin-bottom: 100px;"></div>

  </q-page>
</template>
<script>
    const regex = /^\d+-\d+-\d+-\d+$/;
    import 'vue-multiselect/dist/vue-multiselect.css';
    // import 'vue-multiselect/dist/vue-multiselect.min.css'
    import Multiselect from 'vue-multiselect'
    import $ from 'jquery';  
    import Quagga from 'quagga';
    import ProductComponent from 'components/ProductComponent.vue';
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    // function getUserMedia(constraints, success, failure) {
    //     navigator.getUserMedia(constraints, function(stream) {
    //         var videoSrc = (window.URL && window.URL.createObjectURL(stream)) || stream;
    //         success.apply(null, [videoSrc]);
    //     }, failure);
    // }


   
    export default {
        components: {
            ProductComponent,
            Multiselect
        },
        data() {
            
            return {
                showForm: false,
                scanning: false,
                // Array de pickings
                packings: [],
                form: {
                    product_id: null,
                    name: '',
                    ref_piece: '',
                },
                barcodes_readed: [],
                barcodes_printed: [],
                selected_barcode: null,
                selection: [],
                new_order: false,
                ofs: [],
                selected_of: {},
                mostrarDialogoOf: false,
                selected_palet: null,
                palet_selection: [],
                mostrarBarcodeAlreadyReaded: false,
            }
        },
        methods: {
            togglePalet(palet_index) {
                console.log(this.palet_selection + ' ' + palet_index)
                if (this.palet_selection.length > 0 && this.palet_selection.includes(palet_index)) {
                    let card = document.getElementById(palet_index);
                    if (card == null) {
                        return;
                    }
                    card.style.border = '';
                    if (this.palet_selection.includes(palet_index)) {
                        this.palet_selection = this.palet_selection.filter(palet => palet !== palet_index);
                    }
                    return;
                }
                let card = document.getElementById(palet_index);
                if (card == null) {
                    return;
                }
                this.selected_palet = palet_index;
                card.style.border = '1px solid #1e90ff';
                // Check if the palet is already on the array if not add it
                if (!this.palet_selection.includes(palet_index)) {
                    this.palet_selection.push(palet_index);
                }
                

            },
            toggleSelection(product) {

                const index = this.selection.indexOf(product);
                if (index === -1) {
                    this.selection.push(product);
                    // Poner el borde de la tarjeta seleccionada de color azul
                    // this.changeCard(product);
                } else {
                    this.selection.splice(index, 1);
                    // this.changeCard(product);
                }
                console.log(this.selection);
                // find in which palet is the product
                // let palet_index = this.packings.findIndex(packing => packing.products.includes(product));
                // this.togglePalet(palet_index);
            },
            selectBarcode(barcode) {
                this.selected_barcode = barcode;
                // Poner el borde de la tarjeta seleccionada de color azul
                let card = document.getElementById(barcode);
                if (card.style.border == '1px solid #AC162C') {
                    card.style.border = '';
                } else {
                    card.style.border = '1px solid #AC162C';
                }
                console.log(this.selected_palet)

            },
            deleteOrder() {

                // Itera los packings y elimina los que esten dentro de selection
                this.packings = this.packings.map(packing => {
                    packing.products = packing.products.filter(product => !this.selection.includes(product)) ;
                    return packing;
                });
                // Eliminar palets vacíos
                // this.packings = this.packings.filter(packing => packing.products.length > 0);
                // Limpia la selección
                this.selection = [];
            },  
            ofDialog() {
                // let selected_of = document.getElementById('selected_of');
                // console.log(selected_of.span);
                if (this.selected_of.name == '' || this.selected_of.name == undefined || this.selected_of.name == null) {
                    this.mostrarDialogoOf = true;
                } else {
                    this.mostrarDialogoOf = false;
                }
            
                // this.mostrarDialogoOf = true;
            },
            nuevoPalet() {
                if (this.selected_of.name == '' || this.selected_of.name == undefined || this.selected_of.name == null) {
                    return;
                } 
                // añadir un nuevo packing 
                let new_palet = {
                    name: '',
                    of_group: this.selected_of.name,
                    products: [],
                    id: this.packings.length
                };
                this.packings.push(new_palet);
            },
            confirmOrder() {
                // Lógica para confirmar la orden
                console.log('Pcking confirmado');
                this.barcodes_readed = [];
                this.selected_barcode = null;
                this.scanning = false;

                let palets_to_confirm = this.palet_selection.map(palet => this.packings[palet]);
                // fetch this url 'https://192.168.1.158:3002/add-picking'
                // allow cors in the server
                console.log(palets_to_confirm);
                fetch('https://192.168.1.158:3002/add-picking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        
                    },
                    body: JSON.stringify(palets_to_confirm),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })

                //remove from packings the palets that are in the palet_selection
                this.packings = this.packings.filter((palet, index) => !this.palet_selection.includes(index));
                this.selection = [];
                this.palet_selection = [];
                this.selected_palet = null;


            },
            confirmBarcode() {
                console.log(this.selected_palet)
                // Lógica para confirmar el barcode
                console.log('Barcode confirmado');
                this.barcodes_readed = this.barcodes_readed.filter(barcode => barcode !== this.selected_barcode);
                

                fetch('https://192.168.1.158:3002/get-product-by-barcode?barcode=' + this.selected_barcode)
                .then(response => { 
                    if (!response.ok) { // Verifica si el código de estado no es 2xx
                        throw new Error('Error en la solicitud: ' + response.status);
                    }
                    return response.json()
                }).then(data => {
                    console.log('Success:', data);
                    // pushear el producto del palet seleccionado
                    // TODO: Review this
                    console.log(this.selected_palet);
                    if (this.packings[this.selected_palet].of_group !== this.selected_of.name) {
                        console.log('El palet seleccionado no pertenece a la OF seleccionada');
                        return;
                    }
                    this.packings[this.selected_palet.toString()].products.push(data);
                })
                .catch( error => {
                    this.mostrarBarcodeAlreadyReaded = true;
                    console.log(error);
                    return;
                });
                Quagga.stop();
                this.scanning = false;
                this.barcodes_readed = [];
                this.selected_barcode = null;
                this.scanning = false;
            },
            scanBarcode() {
                console.log('Scanning ' + this.selected_palet)
                this.scanning = true;
                // Lógica para escanear código de barras con Quagga
                console.log('Escaneando código de barras');
                Quagga.init({
                    inputStream: {
                        name: 'Live',
                        type: 'LiveStream',
                        target: document.querySelector('#interactive')    // Use the correct selector here
                    },
                    decoder: {
                        readers: ['code_128_reader']
                    }
                }, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    Quagga.start();
                });

                Quagga.onDetected(this.onDetected);
            },
            onDetected(result) {
                // console.log(result);
                // append the result to the list of barcodes readed if it is not already there
                if ((!this.barcodes_readed.includes(result.codeResult.code)) &&  (result.codeResult.code.length >= 20 ) && regex.test(result.codeResult.code)) {

                    this.barcodes_readed.push(result.codeResult.code);
                }
                // console.log(this.barcodes_readed);
                // $('#interactive').append(`<p>Barcode detected: ${result.codeResult.code}</p>`);
            },
            changeCard(product) {
                const card = document.getElementById( '#' + product.of + '-' + product.name);
                if (card) { // Add this null check
                    if (card.style.border == '') {
                        card.style.border = '2px solid #AC162C';
                        // reduce el tamaño de la tarjeta en 2 pixeles
                        card.style.width = (card.offsetWidth - 2).toString() + 'px';
                        card.style.height = (card.offsetHeight - 2).toString() + 'px';
                    } else {
                        card.style.border = '';
                        // aumenta el tamaño de la tarjeta en 2 pixeles
                        card.style.width = (card.offsetWidth + 2).toString() + 'px';
                        card.style.height = (card.offsetHeight + 2).toString() + 'px';
                    }
                } else {
                    console.warn('Card element not found');
                }
            },
            
        },
        
        mounted() {

            let search_toolbar = document.getElementById('search-toolbar');
            search_toolbar.innerHTML = '';
            // Carga las ofs disponibles
            fetch('https://192.168.1.158:3002/get-ofs')
            .then(response => response.json())
            .then(data => {
                let result = data.map(of => {
                    return {
                        name: of['NUM_DOC_OF'],
                        value: of['NUM_DOC_OF']
                    }
                });
                
                this.ofs = result;

                console.log(result);
            });

            fetch('https://192.168.1.158:3002/reset-barcodes')
            .then(response => response.json())
            .then(data => {
                console.log(data);
            });
        }
        
    }

    $(function() {
        // var resultCollector = Quagga.ResultCollector.create({
        //     capture: true,
        //     capacity: 20,
        //     blacklist: [{
        //         code: 'WIWV8ETQZ1', format: 'code_93'
        //     }, {
        //         code: 'EH3C-%GU23RK3', format: 'code_93'
        //     }, {
        //         code: 'O308SIHQOXN5SA/PJ', format: 'code_93'
        //     }, {
        //         code: 'DG7Q$TV8JQ/EN', format: 'code_93'
        //     }, {
        //         code: 'VOFD1DB5A.1F6QU', format: 'code_93'
        //     }, {
        //         code: '4SO64P4X8 U4YUU1T-', format: 'code_93'
        //     }],
        //     filter: function(codeResult) {
        //         // only store results which match this constraint
        //         // e.g.: codeResult
        //         return true;
        //     }
        // });
        var App = {
            init: function() {
                console.log('Quagga');
            },
            handleError: function(err) {
                console.log(err);
            },
            // checkCapabilities: function() {
            //     console.log("Quagga");
            // },
            // updateOptionsForMediaRange: function(node, range) {
            //     console.log("Quagga");
            // },
            // applySettingsVisibility: function(setting, capability) {
            //     console.log("Quagga");
            // },
            // initCameraSelection: function(){
            //     console.log("Quagga");
            // },
            // attachListeners: function() {
            //     console.log("Quagga");
            // },
            // _printCollectedResults: function() {
            //     console.log("Quagga");
            // },
            // _accessByPath: function(obj, path, val) {
            //     console.log("Quagga");
            // },
            // _convertNameToState: function(name) {
            //     console.log("Quagga");
            // },
            detachListeners: function() {
                $('.controls').off('click', 'button.stop');
                $('.controls .reader-config-group').off('change', 'input, select');
            },
            // applySetting: function(setting, value) {
            //     console.log('Quagga');
            // },
            // setState: function(path, value) {
            //     console.log('Quagga');
            // },
            inputMapper: {
                inputStream: {
                    constraints: function(value){
                        console.log(value);
                    }
                },
                numOfWorkers: function(value) {
                    return parseInt(value);
                },
                decoder: {
                    readers: function(value) {
                        console.log(value);
                    }
                }
            },
            state: {
                inputStream: {
                    type : 'LiveStream',
                    constraints: {
                        width: {min: 640},
                        height: {min: 480},
                        facingMode: 'environment',
                        aspectRatio: {min: 1, max: 2}
                    }
                },
                locator: {
                    patchSize: 'large',
                    halfSample: true
                },
                numOfWorkers: 2,
                frequency: 10,
                decoder: {
                    readers : [{
                        format: 'code_128_reader',
                        config: {}
                    }]
                },
                locate: true
            },
            lastResult : null
        };

        // App.init();

        Quagga.onProcessed(function(result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: 'green', lineWidth: 2});
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: '#00F', lineWidth: 2});
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                }
            }
        });

        Quagga.onDetected(function(result) {
            var code = result.codeResult.code;
            // y si barcode no esta en la lista de barcodes leidos
            if (this.barcodes_readed == undefined) {
                this.barcodes_readed = []
            }
            console.log(this.barcodes_readed)
            if ((App.lastResult !== code) && (code.length >= 20) && (regex.test(code)) && !this.barcodes_readed.includes(code)) {
                App.lastResult = code;
                var $node = null, canvas = Quagga.canvas.dom.image;

                // $node = $('<li><div class='thumbnail'><div class='imgWrapper'><img /></div><div class='caption'><h4 class='code'></h4></div></div></li>');
                $node.find('img').attr('src', canvas.toDataURL());
                $node.find('h4.code').html(code);
                $('#result_strip ul.thumbnails').prepend($node);
                console.log(this.barcodes_readed)
                this.barcodes_readed.push(code);
            }
        });

    });


    
   
    
</script>

<style>
    .input-line {
        display: flex;
        justify-content: space-between;
    }
    #container {
    width: 640px;
    margin: 20px auto;
    padding: 10px;
    }

    #interactive.viewport {
    width: 640px;
    height: 480px;
    }


    #interactive.viewport canvas, video {
    float: left;
    width: 640px;
    height: 480px;
    }

    #interactive.viewport canvas.drawingBuffer, video.drawingBuffer {
    margin-left: -640px;
    }

    .controls fieldset {
    border: none;
    margin: 0;
    padding: 0;
    }

    .controls .input-group {
    float: left;
    }

    .controls .input-group input, .controls .input-group button {
    display: block;
    }

    .controls .reader-config-group {
    float: right;
    }

    .controls .reader-config-group label {
    display: block;
    }

    .controls .reader-config-group label span {
    width: 9rem;
    display: inline-block;
    text-align: right;
    }

    .controls:after {
    content: '';
    display: block;
    clear: both;
    }


    #result_strip {
    margin: 10px 0;
    border-top: 1px solid #EEE;
    border-bottom: 1px solid #EEE;
    padding: 10px 0;
    }

    #result_strip > ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    width: auto;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    }

    #result_strip > ul > li {
    display: inline-block;
    vertical-align: middle;
    width: 160px;
    }

    #result_strip > ul > li .thumbnail {
    padding: 5px;
    margin: 4px;
    border: 1px dashed #CCC;
    }

    #result_strip > ul > li .thumbnail img {
    max-width: 140px;
    }

    #result_strip > ul > li .thumbnail .caption {
    white-space: normal;
    }

    #result_strip > ul > li .thumbnail .caption h4 {
    text-align: center;
    word-wrap: break-word;
    height: 40px;
    margin: 0px;
    }

    #result_strip > ul:after {
    content: '';
    display: table;
    clear: both;
    }


    .scanner-overlay {
    display: none;
    width: 640px;
    height: 510px;
    position: absolute;
    padding: 20px;
    top: 50%;
    margin-top: -275px;
    left: 50%;
    margin-left: -340px;
    background-color: #FFF;
    -moz-box-shadow: #333333 0px 4px 10px;
    -webkit-box-shadow: #333333 0px 4px 10px;
    box-shadow: #333333 0px 4px 10px;
    }

    .scanner-overlay > .header {
    position: relative;
    margin-bottom: 14px;
    }

    .scanner-overlay > .header h4, .scanner-overlay > .header .close {
    line-height: 16px;
    }

    .scanner-overlay > .header h4 {
    margin: 0px;
    padding: 0px;
    }

    .scanner-overlay > .header .close {
    position: absolute;
    right: 0px;
    top: 0px;
    height: 16px;
    width: 16px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    }


    i.icon-24-scan {
    width: 24px;
    height: 24px;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzFFMjMzNTBFNjcwMTFFMkIzMERGOUMzMzEzM0E1QUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzFFMjMzNTFFNjcwMTFFMkIzMERGOUMzMzEzM0E1QUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMUUyMzM0RUU2NzAxMUUyQjMwREY5QzMzMTMzQTVBQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMUUyMzM0RkU2NzAxMUUyQjMwREY5QzMzMTMzQTVBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtQr90wAAAUuSURBVHjanFVLbFRVGP7ua97T9DGPthbamAYYBNSMVbBpjCliWWGIEBMWsnDJxkh8RDeEDW5MDGticMmGBWnSlRSCwgLFNkqmmrRIqzjTznTazkxn5s7c6/efzm0G0Jhwkj/nP+d/nv91tIWFBTQaDQWapkGW67p4ltUub5qmAi0UCqF/a/U2m81tpmddotwwDGSz2dzi4uKSaOucnJycGhsbe1XXdQiIIcdxEAgEtgXq9brySHCht79UXi/8QheawN27d385fPjwuEl6XyKR6LdtW7t06RLK5TKOHj2K/fv3Q87Dw8OYn5/HiRMnMDs7i5mZGQwODiqlPp8PuVwO6XRaOXb16lXl1OnTp5FMJvtosF8M+MWLarWqGJaWlpBKpRRcu3YN4+PjmJ6exsTEhDJw5coVjI6OKgPhcBiZTAbxeBx+vx+XL19Gd3c3Tp48Ka9zqDYgBlTQxYNgMIhIJKLCILkQb+TZsgvdsiyFi+feWRR7oRNZyanQtvW2V4DEUUBiK2eJpeDirSyhCe7F2QPh8fiEp72i9PbsC5G52DbiKZA771yr1dTuGfJ4PQNPFoAyQNR1aNEmsS5eyB3PgjeooMZd2AWvNmzYci/Gea7TeFOcI93jV/K67noGmi4vdRI9gPSDeMLSdKUBZZczlWm1rTtHjLZ24d+WER2tc8N1m+Y+ID74wx0zGYvhg9UNrJdtHJyZRdQfwPsrq9g99xsGlgsYmr6BNzO/IVwsYfjBQ6XYz6JI/72MV366B5/lw0elOkJWGUM3bmKtWjXSLuLaBWhnPnnp0FfoiFi4+TMfVAb2poBkDLjO845uYLEAjL4ALGWBP5YAOsP4AJYBFDaB1HOSVWD2PuV95H2RdV93Lv74/cf6p6Zxq/h6OofeOPJBC39JtONdwOAAViOs4p4OFGTf0Uc8iiyrr9YdQrUnDLsngrVOC0jQib44HlF2RafRZBz1Qy+vfhgK3NJZBlrm+LEm9qWwzFgLU7Ozg0JxZP06jQSRpQ7EerAWDSt6PuhHPmChEAog56fCLvJT5hHTm3OZkz3DyLx7XNWTGEA1GkV14gjWgwbW0ESVjYRwCOuai03L5E7OUBAV4kXSS4auoGIaKOma4m8EA5R1sMEGLh95C+XuLph0WJWpxepYYLtfT0RRgY1KgNODY6BoaChRuEhDCIZQYseuki5KN6hcQHiq7OZNv4/Zq2O6P4Lfkwn46vZjjaYZrIpvWbpzjLErrc4xUGE4avRedpYJalRcIl5hQius/SrPm9xrNOQYJhao6BvNUeWqtY8KaWuNjHOFAr7mM9f4NA4UbKysoUJ8PV9UzVOx6wxDDWUOxnK1pmCD07fOMAvtIsM3l89Dl3HRGhVma9AZMqjOnz2LQqWCxs6dqr3T7x1DTzKJaG8SekcHhg4cgI/56uKdlKnBV/WndqN3YAB/7tyBd3oT6GBIOzs7kc/nDfFdDFT5bS73cp06dQoaPa/Rw/rtO/resTHxxE2m9rCrbSR27UJCcMf1BpiA5rAAGgdfc868fUR1sMwj0cm9Iu9IctweisViB3hhKTHDcHc5jv/LspbyaZrR1OD82/fIlOkuB9LnEWRmDX2TsddUPg3D5gvuc0je0rZaD5EW6G3yjS+A3eeBEWq3XW/Abw1HhUspXADufQb86oW7tZytkYCN//3hHwBvDALPi8EnSOYK8DAOfCc2h4aGcO7cuafkzampqf9UripH12/DtOZbx8ciVGzYy5OO40o25ascGRl5Ssc/AgwAjW3JwqIUjSYAAAAASUVORK5CYII=');
    display: inline-block;
    background-repeat: no-repeat;
    line-height: 24px;
    margin-top: 1px;
    vertical-align: text-top;
    }

    @media (max-width: 603px) {

    #container {
        width: 300px;
        margin: 10px auto;
        -moz-box-shadow: none;
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    #container form.voucher-form input.voucher-code {
        width: 180px;
    }
    }
    @media (max-width: 603px) {

    .reader-config-group {
        width: 100%;
    }

    .reader-config-group label > span {
        width: 50%;
    }

    .reader-config-group label > select, .reader-config-group label > input {
        max-width: calc(50% - 2px);
    }

    #interactive.viewport {
        width: 300px;
        height: 300px;
        overflow: hidden;
    }


    #interactive.viewport canvas, video {
        margin-top: -50px;
        width: 300px;
        height: 400px;
    }

    #interactive.viewport canvas.drawingBuffer, video.drawingBuffer {
        margin-left: -300px;
    }


    #result_strip {
        margin-top: 5px;
        padding-top: 5px;
    }

    #result_strip ul.thumbnails > li {
        width: 150px;
    }

    #result_strip ul.thumbnails > li .thumbnail .imgWrapper {
        width: 130px;
        height: 130px;
        overflow: hidden;
    }

    #result_strip ul.thumbnails > li .thumbnail .imgWrapper img {
        margin-top: -25px;
        width: 130px;
        height: 180px;
    }
    }
    @media (max-width: 603px) {

    .overlay.scanner {
        width: 640px;
        height: 510px;
        padding: 20px;
        margin-top: -275px;
        margin-left: -340px;
        background-color: #FFF;
        -moz-box-shadow: none;
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    .overlay.scanner > .header {
        margin-bottom: 14px;
    }

    .overlay.scanner > .header h4, .overlay.scanner > .header .close {
        line-height: 16px;
    }

    .overlay.scanner > .header .close {
        height: 16px;
        width: 16px;
    }
    }

    .product-component {
        box-sizing: border-box;
        border: 2px solid transparent; /* Borde inicial transparente */
    }

    .product-component.selected {
        border: 2px solid #AC162C; /* Borde visible cuando está seleccionado */
    }

    /* animetion for delete slide, grows from the left to the right in */
    .delete-slide-enter-active, .delete-slide-leave-active {
        transition: margin-left 1s;
    }
    .delete-slide-leave-to  /* .delete-slide-leave-active in <2.1.8 */ {
        margin-left: -100%;
        transform: translateX(-20%);

    }

    .confirm-slide1-enter-active, .confirm-slide1-leave-active {
        transition: margin-right 1s;
    }

    
</style>

