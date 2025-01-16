const express = require('express');
const router = express.Router();

import { connStr, DATABASE, VIEW_NAME } from '.';

app.get('/get-columns', (req, res) => {
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
app.get('/get-ofs', (req, res) => {
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
app.get('/get-product-by-barcode', (req, res) => {
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

  
app.get('/get-last-product', (req, res) => {
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