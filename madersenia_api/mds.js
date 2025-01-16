const express = require('express');
const router = express.Router();
require('dotenv').config();


const DATABASE = process.env.DATABASE;
const HOSTNAME = process.env.DB_HOSTNAME;
const UID = process.env.DB_UID;
const PWD = process.env.DB_PWD;
const TAB_SCHEMA = process.env.TAB_SCHEMA;

const TAB_PRODUCT_NAME = process.env.TAB_PRODUCT_NAME;
const TAB_PACKING_NAME = process.env.TAB_PACKING_NAME;
const TAB_PICKING_NAME = process.env.TAB_PICKING_NAME;
const TAB_BARCODE_NAME = process.env.TAB_BARCODE_NAME;
const VIEW_NAME = process.env.VIEW_NAME;
const NODE_PORT = process.env.NODE_PORT;
const DB_PORT = process.env.DB_PORT;
const ibmdb = require('ibm_db');

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


function dbMiddleware(req, res, next) {
    let conn;
    try {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
      req.dbConnection = conn;  // Agregamos la conexión al objeto `req` para usarla en las rutas
      next();  // Pasar al siguiente middleware o ruta
    } catch (error) {
      res.status(500).json({ error: error.message });
    } 
}

// Cerrar la conexión después de la respuesta o en caso de error
function dbCloseMiddleware(req, res, next) {
    if (req.dbConnection) {
        try {
          req.dbConnection.closeSync();
          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection:", err);
        }
    }
    next();
}

router.get('/get-columns', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
  
      // Primero verificamos la vista
      let checkQuery = `
        SELECT TABSCHEMA, TABNAME 
        FROM SYSCAT.TABLES 
        WHERE TYPE = 'V' 
        AND UPPER(TABSCHEMA) = UPPER('emp1')`;
      
      const tables = conn.querySync(checkQuery);
      console.log("Available views:", tables);
  
      // Luego intentamos obtener las columnas
      let query = `
        SELECT COLNAME 
        FROM SYSCAT.COLUMNS 
        WHERE UPPER(TABSCHEMA) = UPPER('emp1') 
        AND UPPER(TABNAME) = UPPER('vgesco_query_etq_tal3')
        ORDER BY COLNO`;
  
      const data = conn.querySync(query);
      console.log("Columns in view:", data);
  
      res.status(200).json({ tables, columns: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (conn) {
        try {
          conn.closeSync();
          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection:", err);
        }
      }
    }
  });

  
// OK
router.get('/get-ofs', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
  
      let query = `
      SELECT DISTINCT NUM_DOCUMENT_OF 
      FROM ${VIEW_NAME.toUpperCase()}
      ORDER BY NUM_DOCUMENT_OF`; //${TAB_SCHEMA}.${TAB_BARCODE_NAME}`;
  
      const data = conn.querySync(query);
      console.log("Data in view:", data);
  
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (conn) {
        try {
          conn.closeSync();
          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection:", err);
        }
      }
    }
  
  });

  

  
// OK
router.get('/get-product-by-barcode', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
  
      const barcode = req.query.barcode;
      console.log("Barcode:", barcode);
  
      let query = `
        SELECT * 
        FROM ${VIEW_NAME.toUpperCase()}
        WHERE CODI_PRODUCTE = ?`;
      
      const data = conn.querySync(query, [barcode]);
      console.log("Data in view:", data);
  
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (conn) {
        try {
          conn.closeSync();
          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection:", err);
        }
      }
    }
  });

  
  router.get('/get-last-product', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + connStr);
      conn = ibmdb.openSync(connStr);
      console.log("Connected to: " + DATABASE);
  
      let query = `
        SELECT CODI_PRODUCTE, DESCRIPCIO, NUM_DOCUMENT_OF, EXERCICI_OF 
        FROM EMP1.VGESCO_QUERY_ETQ_TAL3 
        WHERE NUM_DOCUMENT_OF = (
          SELECT MAX(NUM_DOCUMENT_OF) 
          FROM EMP1.VGESCO_QUERY_ETQ_TAL3
          WHERE EXERCICI_OF = (
            SELECT MAX(EXERCICI_OF) 
            FROM EMP1.VGESCO_QUERY_ETQ_TAL3
          )
        )`;
      
      const data = conn.querySync(query);
      console.log("Last product added:", data);
  
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (conn) {
        try {
          conn.closeSync();
          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection:", err);
        }
      }
    }
  });

  module.exports = router;
