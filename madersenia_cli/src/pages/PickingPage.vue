<template>
    <q-card @click="toggleSelection(`#${picking_index}`); " :id="'#'+picking_index" style="0px; background-color: #f5f5f5;" v-for="(picking, picking_index) in this.pickings" :key="picking_index" >
        <q-card-header>
            <q-item>
                <q-item-section>
                    <q-item-label style="font-size: large">ORDEN #{{picking.id}} </q-item-label>
                    <q-item-label caption>Fecha: {{ picking.date }} | Orden: {{ picking.order }} | Numero de palets: {{ picking.packings.length }}</q-item-label>
                </q-item-section>
            </q-item>
        </q-card-header>
        <q-card-section v-show="this.selected_picking == `#${picking_index}`">
            <q-card @click.stop @click="toggleSelection(`#${picking_index}-${packing_index}`); " :id="'#'+picking_index+'-'+packing_index" style="margin: 10px 0px 10px 0px;" v-for="(packing, packing_index) in picking.packings" :key="packing_index">
                <q-card-section>
                    <q-item-label>Palet #{{packing.id}}-{{packing.of_group}}-{{packing.products[0].plant}} </q-item-label>
                    <q-item-label caption>OF: {{packing.of_group }} | Numero de productos: {{ packing.products.length }}</q-item-label>
                </q-card-section>
                
                <q-card-section v-show="this.selected_packing == `#${picking_index}-${packing_index}`" style="margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;">
                    <q-item v-for="(product, product_index) in packing.products" :key="product_index">
                        <q-item-section>
                            <ProductComponent
                                :id="`#${picking_index}-${packing_index}-${product_index}`"
                                v-model="this.pickings[picking_index].packings[packing_index].products[product_index]"
                                :style="{ background: '#f5f5f5', margin: '0px 10px 0px 10px !important', padding: `0px 10px 0px 10px !important`, }"
                                @click.stop  @click="toggleSelection(`#${picking_index}-${packing_index}-${product_index}`); console.log(this.selected_product + `#${picking_index}-${packing_index}-${product_index}`)"
                            />
                            <div @click.stop v-if="this.selected_product == `#${picking_index}-${packing_index}-${product_index}`" style="margin: 10px 0px 10px 0px; padding: 10px 10px 10px 10px; background-color: #f5f5f5;">
                                <q-input v-model="product.name" label="Nombre" @input="updateProduct" />
                                <q-input v-model="product.ref_piece" label="Referencia de Pieza"  @input="updateProduct" />
                                <q-input v-model="product.description" label="Descripción"  @input="updateProduct"/>
                                <q-input v-model="product.width" label="Ancho"  @input="updateProduct" />
                                <q-input v-model="product.height" label="Alto"  @input="updateProduct" />
                                <q-input v-model="product.thick" label="Grosor" @input="updateProduct" />
                                <q-input v-model="product.raw_material" label="Material"  @input="updateProduct" />
                                <q-input v-model="product.building" label="Edificio"  @input="updateProduct"/>
                                <q-input v-model="product.plant" label="Planta"  @input="updateProduct" />
                                <q-input v-model="product.room" label="Habitación"  @input="updateProduct" />
                            </div>
                           
                        </q-item-section>
                    </q-item>
                    <q-tiem style="margin: 10px;"></q-tiem>
                </q-card-section>
            </q-card>
        </q-card-section>
    </q-card>
    <div v-show="pickings.length > 0" style="background-color: white; color: green; position: fixed; bottom: 0; width: 100%; height: 56px;" >
        <transition 
            name="confirm-slide1"
            enter-active-class="animated slideInLeft"
            leave-active-class="animated faster fadeOut slower slideOutLeft linear"
            >
            <div 
                v-if="(this.selected_packing || this.selected_product || this.selected_picking) && pickings.length > 0 && this.original_pickings != this.pickings"
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
                <p style="font-size: x-large; margin: 0px">GUARDAR</p>
            </div>
        </transition>
        <transition name="confirm-slide2"
            enter-active-class="animated fadeIn"
        >
            <div v-if="!(this.selected_packing || this.selected_product || this.selected_picking) && pickings.length > 0 && this.original_pickings != this.pickings"
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

                }"
                class="grow">
                <p style="font-size: x-large; margin: 0px">GUARDAR</p>
            </div> 
        </transition>
        <transition name="delete-slide"
            enter-active-class="animated slideInLeft"
        >
            <div 
                v-if="(this.selected_picking || this.selected_packing || this.selected_product) && this.original_pickings != this.pickings" 
                @click="deleteItems" 
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
                ELIMINAR <b style="font-size: x-large;">1</b> {{ selected_product ? 'PRODUCTO' : selected_packing ? 'PALETA' : selected_picking ? 'ORDEN' : '' }}
            </div>
        </transition>
        <transition name="delete-slide"
            enter-active-class="animated slideInLeft"
        >
            <div 
                v-if="(this.selected_picking || this.selected_packing || this.selected_product) && this.original_pickings == this.pickings" 
                @click="deleteItems" 
                :style="{ 
                    backgroundColor: 'red',
                    color: 'white', 
                    position: 'fixed', 
                    bottom: '0', 
                    left: '0', 
                    width: '100%', 
                    padding: '10px', 
                    cursor: 'pointer',
                    textAlign: 'center',
                    float: 'left',
                    fontSize: 'large',
                }"
                class="grow"
            > 
                ELIMINAR <b style="font-size: x-large;">1</b> {{ selected_product ? 'PRODUCTO' : selected_packing ? 'PALETA' : selected_picking ? 'ORDEN' : '' }}
            </div>
        </transition>
    </div>
    
</template>

<script>
    const page_length = 2;
    import ProductComponent from 'components/ProductComponent.vue';
    export default {
        name: 'PickingPage',
        data() {
            return {
                original_pickings: [],
                pickings: [],

                data: null,
                selection: [],
                previousSelection: [],

                selected_product: null,
                selected_packing: null,
                selected_picking: null,
                actual_page: 1,
                total_pages: 0,
            }
        },
        components: {
            ProductComponent
        },
        methods: {
            confirmOrder() {
                console.log('Confirmar orden:', this.pickings);
                // TODO: guarda los items que tenga en pickings
                // post to save the pickings
                fetch('http://192.168.1.159:3001/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.pickings)
                })
                .then(response => response.json())
                .then(data => {
                    this.getPickings();
                })

            },
            selectProduct(cadena) { 
                // console.log("cadena" + cadena)
                if (this.selected_product == cadena) {
                    // obtener todos los productos de la paleta, iterarlos y quitarles el borde
                    let card = document.getElementById(cadena);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                    this.selected_product = null;

                    return;
                }


                // Set other products to not selected
                let picking_index = parseInt(cadena.split('-')[0].split('#')[1]);
                let packing_index = parseInt(cadena.split('-')[1]);
                this.pickings[picking_index].packings[packing_index].products.forEach((product, index) => {
                    let card = document.getElementById(`#${picking_index}-${packing_index}-${index}`);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                });

                    // console.log("cadena" + cadena)
                let card = document.getElementById(cadena);
                card.classList.add('selected-qcard');
                // let product_index = parseInt(cadena.split('-')[2]);
                // console.log(this.original_pickings[picking_index].packings[packing_index].products[product_index])
                // console.log(this.pickings[picking_index].packings[packing_index].products[product_index])
                // console.log(this.pickings === this.original_pickings)
                this.selected_product = cadena; 
                
            },
            selectPacking(cadena) {
                if (this.selected_packing == cadena) {
                    let card = document.getElementById(cadena);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                    // Also remove the border from the product
                    let picking_index = parseInt(cadena.split('#')[1].split('-')[0]);
                    let packing_index = parseInt(cadena.split('#')[1].split('-')[1]);
                    let i = 0;
                    this.pickings[picking_index].packings[packing_index].products.forEach(product => {
                        console.log(product)
                        let card = document.getElementById(cadena + '-' + i);
                        // console.log("asd" + cadena + '-' + i)
                        if (card && card.classList.contains('selected-qcard')) {
                            card.classList.remove('selected-qcard');
                        }
                        i++;
                    });
                    this.selected_packing = null;
                    this.selected_product = null;
                    return;

                }


                // Set other packings to not selected
                let picking_index = parseInt(cadena.split('#')[1].split('-')[0]);
                this.pickings[picking_index].packings.forEach((packing, index) => {
                    let card = document.getElementById(`#${picking_index}-${index}`);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                });

                this.selected_packing = cadena;
                let card = document.getElementById(cadena);
                card.classList.add('selected-qcard');

                
            },
            selectPicking(cadena) {
                if (this.selected_picking == cadena) {
                    let card = document.getElementById(cadena);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                    // Also remove the border from the packings
                    let picking_index = parseInt(cadena.split('#')[1]);
                    this.pickings[picking_index].packings.forEach(packing => {
                        let card = document.getElementById(cadena + '-' + packing.id);
                        if (card && card.classList.contains('selected-qcard')) {
                            card.classList.remove('selected-qcard');
                        }
                        packing.products.forEach(product => {
                            let card = document.getElementById(cadena + '-' + packing.id + '-' + product.id);
                            if (card && card.classList.contains('selected-qcard')) {
                                card.classList.remove('selected-qcard');
                            }
                        });
                    });

                    this.selected_picking = null;
                    this.selected_packing = null;
                    this.selected_product = null;
                    return;
                }


                // Set other pickings to not selected
                this.pickings.forEach((picking, index) => {
                    let card = document.getElementById('#' + index);
                    if (card && card.classList.contains('selected-qcard')) {
                        card.classList.remove('selected-qcard');
                    }
                });

                this.selected_picking = cadena;
                let card = document.getElementById(cadena);
                card.classList.add('selected-qcard');


                
            },
            getPickings() {

                let search_toolbar = document.getElementById('search-toolbar');
                search_toolbar.innerHTML = '';
                let html = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div id="pages"></div>
                        <input
                        id="search-bar"
                        v-model="searchModel"
                        placeholder="Buscar..."
                        style="text-align: center; color: white; padding: 10px; border-radius: 20px; border: 1px solid #AC162C; margin-left: 10px; margin-right: 20px;"
                        />
                    </div>`
                search_toolbar.innerHTML = html;


                fetch(`http://192.168.1.159:3001/page?page=1&length=${page_length}`)
                .then(response => response.json())
                .then(data => {
                    this.pickings = data;
                    this.original_pickings = JSON.parse(JSON.stringify(data));
                    this.data = data;
                })

                fetch(`http://192.168.1.159:3001/pages?length=${page_length}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Actual page" + this.actual_page)
                    // ◀ 3 / 25 ▶
                    let pickings_pages = data;
                    this.total_pages = pickings_pages;
                    console.log('Numero de paginas:', data);
                    let menu_paging = document.getElementById('pages');
                    menu_paging.innerHTML = '';
                    let button1 = document.createElement('button');
                    button1.id = 'button1';
                    let button2 = document.createElement('button');
                    button2.id = 'button2';
                    button1.innerHTML = '◀ ';
                    // make teh cursor change when it is over the button
                    button1.style.cursor = 'pointer';

                    //boton sin bordes y transpaarente solo se tiene que ver el texto
                    button1.style.border = 'none';
                    button1.style.background = 'transparent';
                    button2.style.border = 'none';
                    button2.style.background = 'transparent';
                    button2.style.cursor = 'pointer';

                    if (this.actual_page <= 1) {
                        button1.disabled = true;
                    } else {
                        button1.disabled = false;
                        button1.innerHTML = '◀';
                        button1.onclick = () => {
                            this.getPickingsPage(this.actual_page - 1);
                        }
                    }

                    if (this.actual_page >= this.total_pages) {
                        button2.disabled = true;
                    } else {
                        button2.disabled = false;
                        button2.innerHTML = '▶';
                        button2.onclick = () => {
                            this.getPickingsPage(this.actual_page + 1);
                        }
                    }

                    menu_paging.appendChild(button1);
                    let page = document.createElement('a');
                    page.id = 'actual-page';
                    page.innerHTML = this.actual_page;

                    menu_paging.appendChild(page);

                    let last_page = document.createElement('a');
                    last_page.innerHTML = ' / ' + pickings_pages.toString();
                    last_page.onclick = () => {
                        this.getPickingsPage(pickings_pages);
                    }
                    
                    menu_paging.appendChild(last_page);

                    menu_paging.appendChild(button2);

                    console.log("Actual page" + this.actual_page)



                })

            },
            getPickingsPage(page_number) {
                this.actual_page = page_number;
                console.log('Página:', page_number);
                fetch(`http://192.168.1.159:3001/page?page=${page_number}&length=${page_length}`)
                .then(response => response.json())
                .then(data => {
                    if ((this.actual_page <= this.total_pages) && (this.actual_page >= 1)) {
                        this.pickings = data;
                        console.log('Pickings:', this.pickings[0].packings[0].products[0].id);
                        this.data = data;
                        let page = document.getElementById('actual-page');
                        page.innerHTML = this.actual_page;
                    }

                    console.log(this.actual_page == 1)
                    let button1 = document.getElementById('button1');
                    let button2 = document.getElementById('button2');
                    // console.log("Actual page", this.actual_page)
                    if (this.actual_page <= 1) {
                        button1.disabled = true;
                    } else {
                        button1.disabled = false;
                        button1.onclick = () => {
                            this.getPickingsPage(this.actual_page - 1);
                        }
                    }
                    console.log(this.actual_page < this.total_pages)
                    if (this.actual_page >= this.total_pages) {
                        button2.disabled = true;
                    } else {
                        button2.disabled = false;
                        button2.onclick = () => {
                            this.getPickingsPage(this.actual_page + 1);
                        }
                    }
                }).catch(error => {
                    console.log('Error:', error);
                })
            },
            deleteItems() {
                console.log('Eliminando producto:', this.selected_product);
                console.log('Eliminando paleta:', this.selected_packing);
                console.log('Eliminando orden:', this.selected_picking);
 
                // Elimina producto si es diferente de null
                if (this.selected_product) {
                    console.log('Entered here')
                    let picking_index = parseInt(this.selected_product.split('-')[0].split('#')[1]);
                    let packing_index = parseInt(this.selected_product.split('-')[1]);
                    let product_index = parseInt(this.selected_product.split('-')[2]);
                    this.pickings[picking_index].packings[packing_index].products = this.pickings[picking_index].packings[packing_index].products.filter((product, index_product) => {
                        return index_product !== product_index;
                    });
                    this.selected_product = null;
                    console.log(this.pickings)
                    return;
                }

                // Elimina packing si es diferente de null
                if (this.selected_packing) {
                    let picking_index = parseInt(this.selected_packing.split('-')[0].split('#')[1]);
                    let packing_index = parseInt(this.selected_packing.split('-')[1]);
                    this.pickings[picking_index].packings = this.pickings[picking_index].packings.filter((packing, index_packing) => {
                        return index_packing !== packing_index;
                    });
                    this.selected_packing = null;
                    return;
                }
                
                // Elimina picking si es diferente de null
                if (this.selected_picking) {
                    this.pickings = this.pickings.filter((picking, index_picking) => {
                        return index_picking !== parseInt(this.selected_picking.split('#')[1]);
                    });
                    this.selected_picking = null;
                    return;
                }

                // Eliminar los elementos de selection
                this.selection = [];
                
            },
            toggleSelection(id) {

                if (id.split('-').length == 1) {
                    this.selectPicking(id);
                } else if (id.split('-').length == 2) {
                    this.selectPacking(id);
                } else if (id.split('-').length == 3) {
                    this.selectProduct(id);
                }
                console.log(this.selected_picking + ' ' + this.selected_packing + ' ' + this.selected_product)

                // console.log(this.pickings)
                console.log('id: ' + id + ' selection: ' + this.selection);

                // miramos si el id ya está en selection, si está lo eliminamos, sino lo añadimos
                let index = this.selection.findIndex(x => x === id);
                if (index === -1) {
                    this.selection.push(id);
                } else {
                    this.selection.splice(index, 1);
                }
            },
            updateProduct(product) {
                console.log('Actualizando producto:', product);
                product[field] = value;
                product.showSaveButton = true;
                let picking_id = parseInt(id.split('-')[0].split('#')[1]);
                let packing_id = parseInt(id.split('-')[1]);
                let product_id = parseInt(id.split('-')[2]);
                this.pickings[picking_id].packings[packing_id].products[product_id] = product;
            },
            saveProduct(product) {
                // Lógica para guardar el producto
                product.showSaveButton = false;
                console.log('Producto guardado:', product);
                // Reload the page
                this.getPickings();
            },
        },
        mounted() {
            this.getPickings();
        }
    }
</script>

<style>
.selected-qcard {
    border: 1px solid #1e90ff !important;
}
</style>