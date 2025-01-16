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

router.delete('/delete-picking/:pickingId', dbMiddleware, dbCloseMiddleware, (req, res) => {
  let conn;
  try {
      const pickingId = parseInt(req.params.pickingId);
      
      if (!pickingId) {
          return res.status(400).json({ error: "Invalid picking ID" });
      }

      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " + CUSTOM_DATABASE);

      // Start transaction
      conn.beginTransactionSync();

      // 1. First get all packings related to this picking
      const packingsQuery = `
          SELECT p.PACKING_ID
          FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME} p
          JOIN ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp ON p.PACKING_ID = pp.PACKING_ID
          WHERE pp.PICKING_ID = ?
      `;
      const packings = conn.querySync(packingsQuery, [pickingId]);

      // 2. For each packing, delete its product relationships and then the packing itself
      for (const packing of packings) {
          // Delete packing-product relationships
          const deletePackingProductQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT
              WHERE PACKING_ID = ?
          `;
          conn.querySync(deletePackingProductQuery, [packing.PACKING_ID]);
      }

      // 3. Delete all picking-packing relationships for this picking
      const deletePickingPackingQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING
          WHERE PICKING_ID = ?
      `;
      conn.querySync(deletePickingPackingQuery, [pickingId]);

      // 4. Delete all packings related to this picking
      if (packings.length > 0) {
          const packingIds = packings.map(p => p.PACKING_ID);
          const deletePackingsQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}
              WHERE PACKING_ID IN (${packingIds.join(',')})
          `;
          conn.querySync(deletePackingsQuery);
      }

      // 5. Finally delete the picking itself
      const deletePickingQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
          WHERE PICKING_ID = ?
      `;
      conn.querySync(deletePickingQuery, [pickingId]);

      // Commit transaction
      conn.commitTransactionSync();

      res.status(200).json({ 
          message: "Picking and all related data deleted successfully",
          details: {
              pickingId: pickingId,
              packingsDeleted: packings.length
          }
      });

  } catch (error) {
      console.error("Error in delete process:", error);
      if (conn) {
          try {
              conn.rollbackTransactionSync();
          } catch (rollbackError) {
              console.error("Error rolling back transaction:", rollbackError);
          }
      }
      res.status(500).json({ 
          error: "Failed to delete picking",
          details: error.message 
      });
  } finally {
      if (conn) {
          try {
              conn.closeSync();
              console.log("Connection closed");
          } catch (err) {
              console.error("Error closing connection:", err);
          }
      }
  }
});

router.delete('/delete-packing/:packingId', dbMiddleware, dbCloseMiddleware, (req, res) => {
  let conn;
  try {
      const packingId = parseInt(req.params.packingId);
      
      if (!packingId) {
          return res.status(400).json({ error: "Invalid packing ID" });
      }

      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " + CUSTOM_DATABASE);

      // Start transaction
      conn.beginTransactionSync();

      // 1. First get the picking that this packing belongs to
      const getPickingQuery = `
          SELECT pp.PICKING_ID
          FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp
          WHERE pp.PACKING_ID = ?
      `;
      const pickingResult = conn.querySync(getPickingQuery, [packingId]);
      
      if (pickingResult.length === 0) {
          return res.status(404).json({ error: "Packing not found or not associated with any picking" });
      }

      const pickingId = pickingResult[0].PICKING_ID;

      // 2. Check if this picking has other packings
      const checkOtherPackingsQuery = `
          SELECT COUNT(*) as COUNT
          FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING
          WHERE PICKING_ID = ? AND PACKING_ID != ?
      `;
      const [otherPackingsCount] = conn.querySync(checkOtherPackingsQuery, [pickingId, packingId]);
      const shouldDeletePicking = otherPackingsCount.COUNT === 0;

      // 3. Delete packing-product relationships
      const deletePackingProductQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT
          WHERE PACKING_ID = ?
      `;
      conn.querySync(deletePackingProductQuery, [packingId]);

      // 4. Delete picking-packing relationship
      const deletePickingPackingQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING
          WHERE PACKING_ID = ?
      `;
      conn.querySync(deletePickingPackingQuery, [packingId]);

      // 5. Delete the packing itself
      const deletePackingQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}
          WHERE PACKING_ID = ?
      `;
      conn.querySync(deletePackingQuery, [packingId]);

      // 6. If this was the last packing, delete the picking too
      let pickingDeleted = false;
      if (shouldDeletePicking) {
          const deletePickingQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
              WHERE PICKING_ID = ?
          `;
          conn.querySync(deletePickingQuery, [pickingId]);
          pickingDeleted = true;
      }

      // Commit transaction
      conn.commitTransactionSync();

      res.status(200).json({ 
          message: "Packing and related data deleted successfully",
          details: {
              packingId: packingId,
              pickingId: pickingId,
              pickingDeleted: pickingDeleted
          }
      });

  } catch (error) {
      console.error("Error in delete-packing process:", error);
      if (conn) {
          try {
              conn.rollbackTransactionSync();
          } catch (rollbackError) {
              console.error("Error rolling back transaction:", rollbackError);
          }
      }
      res.status(500).json({ 
          error: "Failed to delete packing",
          details: error.message 
      });
  } finally {
      if (conn) {
          try {
              conn.closeSync();
              console.log("Connection closed");
          } catch (err) {
              console.error("Error closing connection:", err);
          }
      }
  }
});

router.delete('/delete-product/:productId', dbMiddleware, dbCloseMiddleware, (req, res) => {
  let conn;
  try {
      const productId = parseInt(req.params.productId);
      
      if (!productId) {
          return res.status(400).json({ error: "Invalid product ID" });
      }

      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " + CUSTOM_DATABASE);

      // Start transaction
      conn.beginTransactionSync();

      // 1. First get all packings that contain this product
      const getPackingsQuery = `
          SELECT DISTINCT pp.PACKING_ID
          FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT pp
          WHERE pp.PRODUCT_ID = ?
      `;
      const packingResults = conn.querySync(getPackingsQuery, [productId]);
      
      // Track what will be deleted
      const toDelete = {
          packings: [],
          pickings: [],
          packingProductRelations: 0
      };

      // 2. For each packing, check if it will become empty after removing this product
      for (const packing of packingResults) {
          const packingId = packing.PACKING_ID;
          
          // Check if packing has other products
          const checkOtherProductsQuery = `
              SELECT COUNT(*) as COUNT
              FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT
              WHERE PACKING_ID = ? AND PRODUCT_ID != ?
          `;
          const [otherProductsCount] = conn.querySync(checkOtherProductsQuery, [packingId, productId]);
          
          if (otherProductsCount.COUNT === 0) {
              // This packing will be empty, so we need to delete it
              toDelete.packings.push(packingId);
              
              // Check if the related picking will become empty
              const getPickingQuery = `
                  SELECT pp.PICKING_ID
                  FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp
                  WHERE pp.PACKING_ID = ?
              `;
              const pickingResults = conn.querySync(getPickingQuery, [packingId]);
              
              if (pickingResults.length > 0) {
                  const pickingId = pickingResults[0].PICKING_ID;
                  
                  // Check if picking has other packings
                  const checkOtherPackingsQuery = `
                      SELECT COUNT(*) as COUNT
                      FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp
                      WHERE pp.PICKING_ID = ? AND pp.PACKING_ID NOT IN (${toDelete.packings.join(',')})
                  `;
                  const [otherPackingsCount] = conn.querySync(checkOtherPackingsQuery, [pickingId]);
                  
                  if (otherPackingsCount.COUNT === 0 && !toDelete.pickings.includes(pickingId)) {
                      toDelete.pickings.push(pickingId);
                  }
              }
          }
      }

      // 3. Delete everything in the correct order
      // First delete packing-product relationships
      const deletePackingProductQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT
          WHERE PRODUCT_ID = ?
      `;
      const deleteResult = conn.querySync(deletePackingProductQuery, [productId]);
      toDelete.packingProductRelations = deleteResult.length || 0;

      // If there are packings to delete
      if (toDelete.packings.length > 0) {
          // Delete picking-packing relationships
          const deletePickingPackingQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING
              WHERE PACKING_ID IN (${toDelete.packings.join(',')})
          `;
          conn.querySync(deletePickingPackingQuery);

          // Delete the packings
          const deletePackingsQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}
              WHERE PACKING_ID IN (${toDelete.packings.join(',')})
          `;
          conn.querySync(deletePackingsQuery);
      }

      // If there are pickings to delete
      if (toDelete.pickings.length > 0) {
          const deletePickingsQuery = `
              DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
              WHERE PICKING_ID IN (${toDelete.pickings.join(',')})
          `;
          conn.querySync(deletePickingsQuery);
      }

      // Finally delete the product
      const deleteProductQuery = `
          DELETE FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME}
          WHERE PRODUCT_ID = ?
      `;
      conn.querySync(deleteProductQuery, [productId]);

      // Commit transaction
      conn.commitTransactionSync();

      res.status(200).json({ 
          message: "Product and related data deleted successfully",
          details: {
              productId: productId,
              packingsDeleted: toDelete.packings,
              pickingsDeleted: toDelete.pickings,
              packingProductRelationsDeleted: toDelete.packingProductRelations
          }
      });

  } catch (error) {
      console.error("Error in delete-product process:", error);
      if (conn) {
          try {
              conn.rollbackTransactionSync();
          } catch (rollbackError) {
              console.error("Error rolling back transaction:", rollbackError);
          }
      }
      res.status(500).json({ 
          error: "Failed to delete product",
          details: error.message 
      });
  } finally {
      if (conn) {
          try {
              conn.closeSync();
              console.log("Connection closed");
          } catch (err) {
              console.error("Error closing connection:", err);
          }
      }
  }
});

router.post('/save-pickings', dbMiddleware, dbCloseMiddleware, (req, res) => {
  let conn;
  try {
      const pickingsData = req.body;
      
      if (!Array.isArray(pickingsData)) {
          return res.status(400).json({ error: "Input must be an array of pickings" });
      }

      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " + CUSTOM_DATABASE);

      // Start transaction
      conn.beginTransactionSync();

      const updateSummary = {
          pickingsUpdated: 0,
          packingsUpdated: 0,
          productsUpdated: 0,
          errors: []
      };

      for (const picking of pickingsData) {
          try {
              if (!picking.picking_id) {
                  throw new Error(`Missing picking_id in picking data`);
              }

              // Update picking
              const updatePickingQuery = `
                  UPDATE ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
                  SET NAME = ?
                  WHERE PICKING_ID = ?
              `;
              conn.querySync(updatePickingQuery, [
                  picking.picking_name || picking.NAME,
                  picking.picking_id
              ]);
              updateSummary.pickingsUpdated++;

              // Handle packings
              if (Array.isArray(picking.packings)) {
                  for (const packing of picking.packings) {
                      if (!packing.PACKING_ID) {
                          continue;
                      }

                      // Update packing
                      const updatePackingQuery = `
                          UPDATE ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}
                          SET 
                              NAME = ?,
                              OF_GROUP = ?
                          WHERE PACKING_ID = ?
                      `;
                      conn.querySync(updatePackingQuery, [
                          packing.PACKING_NAME || packing.NAME,
                          packing.OF_GROUP || '',
                          packing.PACKING_ID
                      ]);
                      updateSummary.packingsUpdated++;

                      // Handle products in this packing
                      if (Array.isArray(packing.products)) {
                          // First, delete existing packing-product relationships
                          const deletePackingProductQuery = `
                              DELETE FROM ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT
                              WHERE PACKING_ID = ?
                          `;
                          conn.querySync(deletePackingProductQuery, [packing.PACKING_ID]);

                          // Then create new relationships with updated quantities
                          for (const product of packing.products) {
                              if (!product.PRODUCT_ID && !product.CODI_PRODUCTE) {
                                  continue;
                              }

                              // If we only have CODI_PRODUCTE, find the PRODUCT_ID
                              let productId = product.PRODUCT_ID;
                              if (!productId && product.CODI_PRODUCTE) {
                                  const findProductQuery = `
                                      SELECT PRODUCT_ID 
                                      FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME}
                                      WHERE CODI_PRODUCTE = ?
                                  `;
                                  const productResult = conn.querySync(findProductQuery, [product.CODI_PRODUCTE]);
                                  if (productResult.length > 0) {
                                      productId = productResult[0].PRODUCT_ID;
                                  }
                              }

                              if (productId) {
                                  // Update product information
                                  const updateProductQuery = `
                                      UPDATE ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME}
                                      SET 
                                          DESCRIPCIO = ?,
                                          TIPUS_EMBALATGE = ?,
                                          CODI_PERSONAL = ?,
                                          NOM_PERSONAL = ?,
                                          LARGO = ?,
                                          ANCHO = ?,
                                          GRUESO = ?,
                                          MP1 = ?,
                                          MP1_DESCRIPCIO = ?,
                                          UBICACIO_1 = ?,
                                          UBICACIO_2 = ?,
                                          UBICACIO_3 = ?,
                                          QUANTITAT = ?
                                      WHERE PRODUCT_ID = ?
                                  `;
                                  conn.querySync(updateProductQuery, [
                                      product.DESCRIPCIO || '',
                                      product.TIPUS_EMBALATGE || '',
                                      product.CODI_PERSONAL || '',
                                      product.NOM_PERSONAL || '',
                                      product.LARGO || 0,
                                      product.ANCHO || 0,
                                      product.GRUESO || 0,
                                      product.MP1 || '',
                                      product.MP1_DESCRIPCIO || '',
                                      product.UBICACIO_1 || '',
                                      product.UBICACIO_2 || '',
                                      product.UBICACIO_3 || '',
                                      product.QUANTITAT || 0,
                                      productId
                                  ]);
                                  updateSummary.productsUpdated++;

                                  // Create new packing-product relationship
                                  const insertPackingProductQuery = `
                                      INSERT INTO ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT 
                                      (PACKING_ID, PRODUCT_ID, QUANTITY) 
                                      VALUES (?, ?, ?)
                                  `;
                                  conn.querySync(insertPackingProductQuery, [
                                      packing.PACKING_ID,
                                      productId,
                                      product.QUANTITAT || 0
                                  ]);
                              }
                          }
                      }
                  }
              }
          } catch (pickingError) {
              updateSummary.errors.push({
                  picking_id: picking.picking_id,
                  error: pickingError.message
              });
          }
      }

      // If there were any errors, roll back
      if (updateSummary.errors.length > 0) {
          throw new Error("Errors occurred during update");
      }

      // Commit transaction
      conn.commitTransactionSync();

      res.status(200).json({
          message: "Pickings updated successfully",
          summary: updateSummary
      });

  } catch (error) {
      console.error("Error in save-pickings process:", error);
      if (conn) {
          try {
              conn.rollbackTransactionSync();
          } catch (rollbackError) {
              console.error("Error rolling back transaction:", rollbackError);
          }
      }
      res.status(500).json({
          error: "Failed to update pickings",
          details: error.message,
          summary: updateSummary
      });
  } finally {
      if (conn) {
          try {
              conn.closeSync();
              console.log("Connection closed");
          } catch (err) {
              console.error("Error closing connection:", err);
          }
      }
  }
});

