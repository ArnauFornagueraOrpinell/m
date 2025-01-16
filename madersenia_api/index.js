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

export const DATABASE = process.env.DATABASE;
export const HOSTNAME = process.env.DB_HOSTNAME;
export const UID = process.env.DB_UID;
export const PWD = process.env.DB_PWD;
export const TAB_SCHEMA = process.env.TAB_SCHEMA;


export const CUSTOM_DATABASE = process.env.CUSTOM_DATABASE;
export const CUSTOM_HOSTNAME = process.env.CUSTOM_DB_HOSTNAME;
export const CUSTOM_UID = process.env.CUSTOM_DB_UID;
export const CUSTOM_PWD = process.env.CUSTOM_DB_PWD;
export const CUSTOM_TAB_SCHEMA = process.env.CUSTOM_TAB_SCHEMA;

export const TAB_PRODUCT_NAME = process.env.TAB_PRODUCT_NAME;
export const TAB_PACKING_NAME = process.env.TAB_PACKING_NAME;
export const TAB_PICKING_NAME = process.env.TAB_PICKING_NAME;
export const TAB_BARCODE_NAME = process.env.TAB_BARCODE_NAME;
export const VIEW_NAME = process.env.VIEW_NAME;
export const NODE_PORT = process.env.NODE_PORT;
export const DB_PORT = process.env.DB_PORT;

const schema_settings = `CREATE SCHEMA ${TAB_SCHEMA}`;
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
const table1_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} (
  PRODUCT_ID BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  CODI_PRODUCTE VARCHAR(100),
  DESCRIPCIO VARCHAR(100),
  TIPUS_EMBALATGE VARCHAR(100),
  CODI_PERSONAL VARCHAR(100),
  NOM_PERSONAL VARCHAR(100),
  LARGO DECIMAL,
  ANCHO DECIMAL,
  GRUESO DECIMAL,
  MP1 VARCHAR(100),
  MP1_DESCRIPCIO VARCHAR(100),
  UBICACIO_1 VARCHAR(100),
  UBICACIO_2 VARCHAR(100),
  UBICACIO_3 VARCHAR(100),
  QUANTITAT INT
);`;

const table2_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PACKING_NAME} (
  PACKING_ID BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  NAME VARCHAR(100),
  OF_GROUP VARCHAR(100)
);`;

const table3_settings = `
CREATE TABLE ${TAB_SCHEMA}.PACKING_PRODUCT (
  PACKING_ID BIGINT NOT NULL,
  PRODUCT_ID BIGINT NOT NULL,
  QUANTITY INT NOT NULL,
  PRIMARY KEY (PACKING_ID, PRODUCT_ID),
  FOREIGN KEY (PACKING_ID) REFERENCES ${TAB_SCHEMA}.${TAB_PACKING_NAME}(PACKING_ID),
  FOREIGN KEY (PRODUCT_ID) REFERENCES ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}(PRODUCT_ID)
);`;

const table4_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PICKING_NAME} (
  PICKING_ID BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  NAME VARCHAR(100)
);`;

const table5_settings = `
CREATE TABLE ${TAB_SCHEMA}.PICKING_PACKING (
  PICKING_ID BIGINT NOT NULL,
  PACKING_ID BIGINT NOT NULL,
  PRIMARY KEY (PICKING_ID, PACKING_ID),
  FOREIGN KEY (PICKING_ID) REFERENCES ${TAB_SCHEMA}.${TAB_PICKING_NAME}(PICKING_ID),
  FOREIGN KEY (PACKING_ID) REFERENCES ${TAB_SCHEMA}.${TAB_PACKING_NAME}(PACKING_ID)
);`;


// Exercici_OF Clase_OF Series_OF Num_doc_of Codi_Producte Descripcio Tipus embalatge (PeÃ§a 00 moble es 01) Codi_personal Nom_personal Largo Ancho Grueso MP1 MP1_Descripcio Ubicacio 1 Ubicacio 2 Ubicacio 3 Quantitat
const table_barcode_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_BARCODE_NAME} (
  BARCODE VARCHAR(100) NOT NULL PRIMARY KEY,
  PRODUCT_ID BIGINT NOT NULL,
  EXCERCICI_OF VARCHAR(100) NOT NULL,
  CLASE_OF VARCHAR(100) NOT NULL,
  SERIES_OF VARCHAR(100) NOT NULL,
  NUM_DOC_OF VARCHAR(100) NOT NULL,
  FOREIGN KEY (PRODUCT_ID) REFERENCES ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}(PRODUCT_ID)
);`;

// The view is a join of the barcode and the product table
const view_settings = `
  CREATE VIEW ${TAB_SCHEMA}.${VIEW_NAME} AS
  SELECT * FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}
  JOIN ${TAB_SCHEMA}.${TAB_BARCODE_NAME} ON ${TAB_SCHEMA}.${TAB_BARCODE_NAME}.PRODUCT_ID = ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}.PRODUCT_ID
  `;

export const connStr = `DATABASE=${DATABASE};` +
  `HOSTNAME=${HOSTNAME};` +
  `UID=${UID};` +
  `PWD=${PWD};` +
  `PORT=${DB_PORT};` +
  `PROTOCOL=TCPIP;` +
  `AUTHENTICATION=SERVER;` +  // Especificar autenticación
  `CONNECTTIMEOUT=30;` +      // Timeout de conexión en segundos
  `QUERYTIMEOUT=180;` +       // Timeout de consultas
  `CURRENTSCHEMA=${TAB_SCHEMA};`; // Schema por defecto

export const customConnStr = `DATABASE=${CUSTOM_DATABASE};` +
  `HOSTNAME=${CUSTOM_HOSTNAME};` +
  `UID=${UID};` +
  `PWD=${PWD};` +
  `PORT=${DB_PORT};` +
  `PROTOCOL=TCPIP;` +
  `AUTHENTICATION=SERVER;` +  // Especificar autenticación
  `CONNECTTIMEOUT=30;` +      // Timeout de conexión en segundos
  `QUERYTIMEOUT=180;` +       // Timeout de consultas
  `CURRENTSCHEMA=${TAB_SCHEMA};`; // Schema por defecto

// OK
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// OK
httpsServer.listen(NODE_PORT, () => {
  console.log(`Example app listening on port ${NODE_PORT}`)
})

// OK// Función helper para ejecutar queries de forma asíncrona
export const executeQuery = (conn, query) => {
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
export const executeQueriesInSequence = async (conn, queries) => {
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


// https://192.168.1.158:3002/page?page=1&length=2 
app.get('/page', (req, res) => {
  const page = req.query.page || 1;
  const length = req.query.length || 10;
  // responder con  una lista de los ultimos pickings, dentro de cada picking, los packings y dentro de cada packing los productos(encapsulados formando un json)
  let conn;
  try {
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);
    // hacer la paginacion
    let query = `
      SELECT * FROM ${TAB_SCHEMA}.${TAB_PICKING_NAME}   
      LIMIT ${length} OFFSET ${(page - 1) * length}
    `;
    const data = conn.querySync(query);
    console.log("Data in view:", data);
    // por cada picking, obtener los packings
    for (let picking of data) {
      query = `
        SELECT * FROM ${TAB_SCHEMA}.PICKING_PACKING
        JOIN ${TAB_SCHEMA}.${TAB_PACKING_NAME} ON ${TAB_SCHEMA}.PICKING_PACKING.id_packing = ${TAB_SCHEMA}.${TAB_PACKING_NAME}.id_packing
        WHERE ${TAB_SCHEMA}.PICKING_PACKING.id_picking = ?
      `;
      const packings = conn.querySync(query, [picking.ID_PICKING]);
      console.log("Packings in picking:", packings);
      picking.packings = packings;
      // por cada packing, obtener los productos
      for (let packing of packings) {
        query = `
          SELECT * FROM ${TAB_SCHEMA}.PACKING_PRODUCT
          JOIN ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} ON ${TAB_SCHEMA}.PACKING_PRODUCT.product_id = ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}.product_id
          WHERE ${TAB_SCHEMA}.PACKING_PRODUCT.id_packing = ?
        `;
        const products = conn.querySync(query, [packing.ID_PACKING]);
        packing.products = products;
        console.log("Products in packing:", products);
      }
    }
    // Get the total number of pages
    query = `SELECT COUNT(*) AS TOTAL FROM ${TAB_SCHEMA}.${TAB_PICKING_NAME}`;
    const [totalResult] = conn.querySync(query);
    const total = totalResult.TOTAL;
    const totalPages = Math.ceil(total / length);
    res.status(200).json({ data, totalPages });
  } catch (error) {
    console.log("Error getting pickings:", error);
    res.status(500).json({ error: error.message });
  }
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

app.post('/delete', (req, res) => {
  let conn;
  try {
    let pickingData = req.body;
    if (pickingData.product) {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
      
      // Iniciar una transacción
      conn.beginTransactionSync();
      
      // Eliminar el producto
      let query = `DELETE FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} WHERE product_id = ?`;
      conn.querySync(query, [pickingData.product.PRODUCT_ID]);

      // Confirmar la transacción
      conn.commitTransactionSync();

      res.status(200).json({ message: "Product deleted successfully" });
    } else if (pickingData.packing) {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);

      // Iniciar una transacción
      conn.beginTransactionSync();

      // Eliminar los productos del packing
      let query = `DELETE FROM ${TAB_SCHEMA}.PACKING_PRODUCT WHERE id_packing = ?`;
      conn.querySync(query, [pickingData.packing.ID_PACKING]);

      // Eliminar el packing
      query = `DELETE FROM ${TAB_SCHEMA}.${TAB_PACKING_NAME} WHERE id_packing = ?`;
      conn.querySync(query, [pickingData.packing.ID_PACKING]);

      // Confirmar la transacción
      conn.commitTransactionSync();

      res.status(200).json({ message: "Packing deleted successfully" });
    } else if (pickingData.picking) {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);

      // Iniciar una transacción
      conn.beginTransactionSync();

      // Eliminar los packings del picking
      let query = `DELETE FROM ${TAB_SCHEMA}.PICKING_PACKING WHERE id_picking = ?`;
      conn.querySync(query, [pickingData.picking.ID_PICKING]);

      // Eliminar el picking
      query = `DELETE FROM ${TAB_SCHEMA}.${TAB_PICKING_NAME} WHERE id_picking = ?`;
      conn.querySync(query, [pickingData.picking.ID_PICKING]);

      // Confirmar la transacción
      conn.commitTransactionSync();

      res.status(200).json({ message: "Picking deleted successfully" });
    } else {
      res.status(400).json({ error: "Invalid request" });
    }
  } catch (error) {
    console.log("Error in delete process:", error);
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