<template>
    <q-page class="q-pa-md">
      <!-- Diálogos -->
      <q-dialog v-model="dialogos.mostrarDialogoOf">
        <q-card>
          <q-card-section class="row items-center bg-warning text-white">
            <q-icon name="warning" size="24px" class="q-mr-sm"/>
            <span>Selecciona una orden de fabricación antes de continuar</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
  
      <q-dialog v-model="dialogos.mostrarBarcodeAlreadyReaded">
        <q-card>
          <q-card-section class="row items-center bg-warning text-white">
            <q-icon name="warning" size="24px" class="q-mr-sm"/>
            <span>El código de barras ya se ha leído previamente</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
  
      <!-- Overlay para nuevo pedido -->
      <div v-show="new_order" class="overlay-container">
        <div class="overlay"></div>
      </div>
  
      <!-- Selector OF -->
      <div v-show="!scanning" class="of-selector q-mb-md">
        <multiselect
          v-model="selected_of"
          :options="ofs"
          placeholder="Selecciona una OF"
          label="name"
          track-by="name"
          class="of-multiselect"
        >
          <template #option="{ option }">
            <div class="multiselect-option">
              <span class="text-weight-medium">OF #{{ option.name }}</span>
            </div>
          </template>
        </multiselect>
      </div>
  
      <!-- Scanner Input -->
      <div v-show="scanning" class="scanner-container q-mb-lg">
        <q-input
          v-model="selected_barcode"
          label="Código de Barras"
          filled
          class="scanner-input"
          bottom-slots
        >
          <template v-slot:append>
            <q-icon name="photo_camera" />
          </template>
        </q-input>
        
        <div id="interactive" class="viewport q-mt-md"></div>
      </div>
  
      <!-- Nuevo Palet Button -->
      <q-card
        v-show="!scanning"
        class="new-palet-card q-mb-lg cursor-pointer"
        :class="{'disabled': !selected_of.name}"
        @click="ofDialog(); nuevoPalet();"
      >
        <q-card-section class="bg-primary text-white">
          <div class="row items-center justify-between">
            <div class="text-h6">NUEVO PALET</div>
            <q-icon name="add_box" size="24px"/>
          </div>
        </q-card-section>
      </q-card>
  
      <!-- Lista de Palets -->
      <div class="palets-container">
        <transition-group
          name="list"
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <q-card
            v-for="(packing, packing_index) in packings"
            :key="packing_index"
            class="palet-card q-mb-md"
            :class="{'selected': palet_selection.includes(packing_index)}"
            @click="togglePalet(packing_index)"
          >
            <q-card-section class="bg-grey-3">
              <div class="row items-center justify-between">
                <div class="text-h6">
                  PALET #{{ packing_index + 1 }}-{{ packing.NUM_DOCUMENT_OF }}
                  {{ packing.products.length > 0 ? '-' + packing.products[0].UBICACIO_3 : '' }}
                </div>
                <q-badge color="primary" class="q-pa-sm">
                  OF: {{ packing.of_group }}
                </q-badge>
              </div>
            </q-card-section>
  
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div 
                  v-for="(product, product_index) in packing.products"
                  :key="product_index"
                  class="col-12 col-md-6"
                >
                  <ProductComponent
                    @click.stop
                    @click="toggleSelection(product)"
                    :id="'#'+product.NUM_DOCUMENT_OF+'-'+product.CODI_PRODUCTE"
                    :class="{ 'selected': selection.includes(product) }"
                    v-model="packings[packing_index].products[product_index]"
                  />
                </div>
              </div>
  
              <!-- Añadir producto button -->
              <q-btn
                v-if="selected_palet === packing_index"
                color="primary"
                icon="add"
                label="Añadir Producto"
                class="full-width q-mt-md"
                @click.stop="ofDialog(); scanBarcode();"
              />
            </q-card-section>
          </q-card>
        </transition-group>
  
        <!-- Empty state -->
        <div v-if="packings.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="inbox" size="48px" color="grey-5"/>
          <div class="text-h6 text-grey-7 q-mt-sm">No hay palets</div>
        </div>
      </div>
  
      <!-- Barra de acciones flotante -->
      <q-page-sticky position="bottom" expand class="action-bar" v-show="packings.length > 0 && !scanning">
        <div class="row full-width">
          <!-- Botón eliminar -->
          <transition
            enter-active-class="animated slideInLeft"
            leave-active-class="animated slideOutLeft"
          >
            <q-btn
              v-if="selection.length > 0"
              color="negative"
              class="col-6"
              @click="deleteOrder"
            >
              <div class="text-center">
                ELIMINAR: <b>{{ selection.length }}</b> 
                PRODUCTO{{ selection.length > 1 ? 'S' : '' }}
              </div>
            </q-btn>
          </transition>
  
          <!-- Botón confirmar -->
          <q-btn
            color="positive"
            :class="selection.length > 0 ? 'col-6' : 'col-12'"
            @click="confirmOrder"
          >
            <div class="text-center">
              CONFIRMAR: <b>{{ palet_selection.length }}</b> PALETS
            </div>
          </q-btn>
        </div>
      </q-page-sticky>
  
      <!-- Botón confirmar código de barras -->
      <q-page-sticky
        v-show="selected_barcode !== null && scanning"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          color="positive"
          icon="check"
          label="Confirmar"
          @click="confirmBarcode"
        />
      </q-page-sticky>
    </q-page>
  </template>
  
  <script>
  import { ref, reactive } from 'vue'
  import Multiselect from 'vue-multiselect'
  import Quagga from 'quagga'
  import ProductComponent from 'components/ProductComponent.vue'
  
  const regex = /^\d+-\d+-\d+-\d+$/
  
  export default {
        name: 'PaletManagementPage',
        
        components: {
        ProductComponent,
        Multiselect
        },
    
        setup() {
        const dialogos = reactive({
            mostrarDialogoOf: false,
            mostrarBarcodeAlreadyReaded: false
        })
    
        return {
            dialogos,
            scanning: ref(false),
            packings: ref([]),
            barcodes_readed: ref([]),
            selected_barcode: ref(null),
            selection: ref([]),
            new_order: ref(false),
            ofs: ref([]),
            selected_of: ref({}),
            selected_palet: ref(null),
            palet_selection: ref([])
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
                // fetch this url 'https://192.168.0.197:3002/add-picking'
                // allow cors in the server
                console.log(palets_to_confirm);
                fetch('https://192.168.0.197:3002/add-picking', {
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
                

                fetch('https://192.168.0.197:3002/get-product-by-barcode?barcode=' + this.selected_barcode)
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
            fetch('https://192.168.0.197:3002/get-ofs')
            .then(response => response.json())
            .then(data => {
                let result = data.map(of => {
                    return {
                        name: of['NUM_DOCUMENT_OF'],
                        value: of['NUM_DOCUMENT_OF']
                    }
                });
                
                this.ofs = result;

                console.log(result);
            });

            fetch('https://192.168.0.197:3002/reset-barcodes')
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

<style lang="scss">
.of-selector {
  max-width: 400px;
  margin: 0 auto;
}

.new-palet-card {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.palet-card {
  transition: all 0.2s ease;
  
  &.selected {
    border: 2px solid var(--q-primary);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
}

.scanner-container {
  max-width: 600px;
  margin: 0 auto;
  
  .scanner-input {
    max-width: 300px;
    margin: 0 auto;
  }
}

.viewport {
  max-width: 100%;
  height: 300px;
  margin: 0 auto;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  
  canvas, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.action-bar {
  .q-btn {
    height: 60px;
    font-size: 1.1em;
  }
}

.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
}

// Responsive adjustments
@media (max-width: 600px) {
  .scanner-container {
    .viewport {
      height: 250px;
    }
  }
  
  .action-bar {
    .q-btn {
      height: 50px;
      font-size: 1em;
    }
  }
}
</style>