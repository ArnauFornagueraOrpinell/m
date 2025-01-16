const express = require('express')
const cors = require('cors');
const https = require('https');
const url = require('url');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const app = express()
const ibmdb = require('ibm_db');
require('dotenv').config();
const querystring = require('querystring');
const { reject } = require('bluebird');

app.use(cors());
app.use(express.json());

// Configuración para HTTPS
// Configuración para HTTPS
const privateKey = fs.readFileSync('/app/server.key', 'utf8');
const certificate = fs.readFileSync('/app/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate, rejectUnauthorized: false };
const httpsServer = https.createServer(credentials, app);




const EXAMPLE_BARCODE = '4907874901004-01-01-205';
let READED_BARCODES = []; 

  const DATABASE = process.env.DATABASE;
  const HOSTNAME = process.env.DB_HOSTNAME;
  const UID = process.env.DB_UID;
  const PWD = process.env.DB_PWD;
  const TAB_SCHEMA = process.env.TAB_SCHEMA;


  const CUSTOM_DATABASE = process.env.CUSTOM_DATABASE;
  const CUSTOM_HOSTNAME = process.env.CUSTOM_DB_HOSTNAME;
  const CUSTOM_UID = process.env.CUSTOM_DB_UID;
  const CUSTOM_PWD = process.env.CUSTOM_DB_PWD;
  const CUSTOM_TAB_SCHEMA = process.env.CUSTOM_TAB_SCHEMA;

  const TAB_PRODUCT_NAME = process.env.TAB_PRODUCT_NAME;
  const TAB_PACKING_NAME = process.env.TAB_PACKING_NAME;
  const TAB_PICKING_NAME = process.env.TAB_PICKING_NAME;
  const TAB_BARCODE_NAME = process.env.TAB_BARCODE_NAME;
  const VIEW_NAME = process.env.VIEW_NAME;
  const NODE_PORT = process.env.NODE_PORT;
  const DB_PORT = process.env.DB_PORT;

// Exercici_OF Clase_OF Series_OF Num_doc_of Codi_Producte Descripcio Tipus embalatge (PeÃ§a 00 moble es 01) Codi_personal Nom_personal Largo Ancho Grueso MP1 MP1_Descripcio Ubicacio 1 Ubicacio 2 Ubicacio 3 Quantitat


// {
//   "EXERCICI_OF": "2024",
//   "CLASE_OF": "OF",
//   "SERIE_OF": "OF",
//   "NUM_DOCUMENT_OF": 140453,
//   "CODI_PRODUCTE": "8024531001          ",
//   "DESCRIPCIO": "PLAFON                                       ",
//   "TIPUS_EMBALATGE": "00",
//   "CODI_PERSONAL": "C802      ",
//   "NOM_PERSONAL": "CALA PINS S.L.                               ",
//   "LARGO": 1110,
//   "ANCHO": 1630,
//   "GRUESO": 19,
//   "MP1": "01B19GK5412CPN560207",
//   "NOM_MP1": "MELAMINA GREIGE TESSEA K541 PN/GREIGE K541 PN",
//   "UBICACIO1": "01   ",
//   "UBICACIO2": "1041 ",
//   "UBICACIO3": "01",
//   "QUANTITAT": 2
// }

// make id autoincremental


  const connStr = `DATABASE=${DATABASE};` +
  `HOSTNAME=${HOSTNAME};` +
  `UID=${UID};` +
  `PWD=${PWD};` +
  `PORT=${DB_PORT};` +
  `PROTOCOL=TCPIP;` +
  `AUTHENTICATION=SERVER;` +  // Especificar autenticación
  `CONNECTTIMEOUT=30;` +      // Timeout de conexión en segundos
  `QUERYTIMEOUT=180;` +       // Timeout de consultas
  `CURRENTSCHEMA=${TAB_SCHEMA};`; // Schema por defecto


const apparattum = require('./apparattum');
app.use('/', apparattum);
const mds = require('./mds');
app.use('/', mds);

// OK
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// OK
httpsServer.listen(NODE_PORT, () => {
  console.log(`Example app listening on port ${NODE_PORT}`)
})

// OK// Función helper para ejecutar queries de forma asíncrona
  const executeQuery = (conn, query) => {
  return new Promise((resolve, reject) => {
    conn.query(query, (err, result) => {
      if (err) {
        console.error(`Error executing query: ${query}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Función helper para ejecutar queries en secuencia
  const executeQueriesInSequence = async (conn, queries) => {
  for (const query of queries) {
    try {
      await executeQuery(conn, query);
      console.log(`Successfully executed: ${query.slice(0, 50)}...`);
    } catch (error) {
      // Si el error es porque el objeto ya existe, continuamos
      if (error.message.includes('SQLSTATE=42710')) {
        console.log('Object already exists, continuing...');
        continue;
      }
      throw error;
    }
  }
};

// OK
const openConnection = promisify(ibmdb.open);




app.get('/reset-barcodes', (req, res) => {
  READED_BARCODES = [];
  res.send('Barcodes has been reseted');
});



app.post('/save', (req, res) => {
//   [
//     {
//         "ID_PICKING": "1",
//         "NAME": "Unnamed Picking",
//         "packings": [
//             {
//                 "ID_PICKING": "1",
//                 "ID_PACKING": "1",
//                 "NAME": "Unnamed Packing",
//                 "OF_GROUP": "140120",
//                 "products": [
//                     {
//                         "ID_PACKING": "1",
//                         "PRODUCT_ID": "1",
//                         "QUANTITY": 16,
//                         "CODI_PRODUCTE": "7090671001",
//                         "DESCRIPCIO": "TAPA",
//                         "TIPUS_EMBALATGE": "BASE",
//                         "CODI_PERSONAL": "600",
//                         "NOM_PERSONAL": "-",
//                         "LARGO": 0,
//                         "ANCHO": 0,
//                         "GRUESO": 0,
//                         "MP1": "CONSTRUCCIONES",
//                         "MP1_DESCRIPCIO": "RUESMA,",
//                         "UBICACIO_1": "S.A.",
//                         "UBICACIO_2": "568",
//                         "UBICACIO_3": "534,5",
//                         "QUANTITAT": "16"
//                     }
//                 ]
//             }
//         ]
//     }
// ]
  let conn;
  try {
    let pickingData = req.body;
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);
    
    // Iniciar una transacción y actualizar el picking
    conn.beginTransactionSync();

    let query = `UPDATE ${TAB_SCHEMA}.${TAB_PICKING_NAME} SET name = ? WHERE id_picking = ?`;
    conn.querySync(query, [pickingData[0].NAME, pickingData[0].ID_PICKING]);

    for (const packing of pickingData[0].packings) {
      // Actualizar el packing
      query = `UPDATE ${TAB_SCHEMA}.${TAB_PACKING_NAME} SET name = ?, of_group = ? WHERE id_packing = ?`;
      conn.querySync(query, [packing.NAME, packing.OF_GROUP, packing.ID_PACKING]);

      for (const product of packing.products) {
        // Actualizar el producto
        query = `
          UPDATE ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} 
          SET Codi_Producte = ?, Descripcio = ?, Tipus_embalatge = ?, Codi_personal = ?, Nom_personal = ?, 
          Largo = ?, Ancho = ?, Grueso = ?, MP1 = ?, MP1_Descripcio = ?, Ubicacio_1 = ?, Ubicacio_2 = ?, Ubicacio_3 = ?, Quantitat = ?
          WHERE product_id = ?
        `;
        conn.querySync(query, [
          product.CODI_PRODUCTE, product.DESCRIPCIO, product.TIPUS_EMBALATGE, product.CODI_PERSONAL,
          product.NOM_PERSONAL, product.LARGO, product.ANCHO, product.GRUESO, product.MP1,
          product.MP1_DESCRIPCIO, product.UBICACIO_1, product.UBICACIO_2, product.UBICACIO_3, product.QUANTITAT,
          product.PRODUCT_ID
        ]);
      }
    }

    // Confirmar la transacción
    conn.commitTransactionSync();

    res.status(200).json({ message: "Picking updated successfully" });
  } catch (error) {
    console.log("Error in save process:", error);
    if (conn) {
      try {
        conn.rollbackTransactionSync();
      } catch (rollbackError) {
        console.log("Error rolling back transaction:", rollbackError);
      }
    }
    res.status(500).json({ error: error.message });
  }
});

