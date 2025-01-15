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

app.use(cors());
app.use(express.json());

// Configuración para HTTPS
// Configuración para HTTPS
const privateKey = fs.readFileSync('/app/server.key', 'utf8');
const certificate = fs.readFileSync('/app/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);




const EXAMPLE_BARCODE = '4907874901004-01-01-205';
let READED_BARCODES = []; 

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

const schema_settings = `CREATE SCHEMA ${TAB_SCHEMA}`;
// Exercici_OF Clase_OF Series_OF Num_doc_of Codi_Producte Descripcio Tipus embalatge (PeÃ§a 00 moble es 01) Codi_personal Nom_personal Largo Ancho Grueso MP1 MP1_Descripcio Ubicacio 1 Ubicacio 2 Ubicacio 3 Quantitat

// make id autoincremental
const table1_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} (
  product_id BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  Codi_Producte BIGINT NOT NULL,
  Descripcio VARCHAR(100) NOT NULL,
  Tipus_embalatge VARCHAR(100) NOT NULL,
  Codi_personal VARCHAR(100) NOT NULL,
  Nom_personal VARCHAR(100) NOT NULL,
  Largo DECIMAL(10, 2) NOT NULL,
  Ancho DECIMAL(10, 2) NOT NULL,
  Grueso DECIMAL(10, 2) NOT NULL,
  MP1 VARCHAR(100) NOT NULL,
  MP1_Descripcio VARCHAR(100) NOT NULL,
  Ubicacio_1 VARCHAR(100) NOT NULL,
  Ubicacio_2 VARCHAR(100) NOT NULL,
  Ubicacio_3 VARCHAR(100) NOT NULL,
  Quantitat BIGINT NOT NULL
);`;

const table2_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PACKING_NAME} (
  id_packing BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  name VARCHAR(100),
  of_group VARCHAR(100)
);`;

const table3_settings = `
CREATE TABLE ${TAB_SCHEMA}.PACKING_PRODUCT (
  id_packing BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (id_packing, product_id),
  FOREIGN KEY (id_packing) REFERENCES ${TAB_SCHEMA}.${TAB_PACKING_NAME}(id_packing),
  FOREIGN KEY (product_id) REFERENCES ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}(product_id)
);`;

const table4_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_PICKING_NAME} (
  id_picking BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  name VARCHAR(100)
);`;

const table5_settings = `
CREATE TABLE ${TAB_SCHEMA}.PICKING_PACKING (
  id_picking BIGINT NOT NULL,
  id_packing BIGINT NOT NULL,
  PRIMARY KEY (id_picking, id_packing),
  FOREIGN KEY (id_picking) REFERENCES ${TAB_SCHEMA}.${TAB_PICKING_NAME}(id_picking),
  FOREIGN KEY (id_packing) REFERENCES ${TAB_SCHEMA}.${TAB_PACKING_NAME}(id_packing)
);`;


// Exercici_OF Clase_OF Series_OF Num_doc_of Codi_Producte Descripcio Tipus embalatge (PeÃ§a 00 moble es 01) Codi_personal Nom_personal Largo Ancho Grueso MP1 MP1_Descripcio Ubicacio 1 Ubicacio 2 Ubicacio 3 Quantitat
const table_barcode_settings = `
CREATE TABLE ${TAB_SCHEMA}.${TAB_BARCODE_NAME} (
  barcode VARCHAR(100) NOT NULL PRIMARY KEY,
  id_product BIGINT NOT NULL,
  Exercici_OF VARCHAR(100) NOT NULL,
  Clase_OF VARCHAR(100) NOT NULL,
  Series_OF VARCHAR(100) NOT NULL,
  Num_doc_of VARCHAR(100) NOT NULL,
  FOREIGN KEY (id_product) REFERENCES ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}(product_id)
);`;

// The view is a join of the barcode and the product table
const view_settings = `
  CREATE VIEW ${TAB_SCHEMA}.${VIEW_NAME} AS
  SELECT * FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}
  JOIN ${TAB_SCHEMA}.${TAB_BARCODE_NAME} ON ${TAB_SCHEMA}.${TAB_BARCODE_NAME}.id_product = ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}.product_id
  `;

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

app.get('/init', async (req, res) => {
  let conn;
  try {
    console.log("Connection string:", connStr);
    
    conn = await new Promise((resolve, reject) => {
      console.log("Initiating connection...");
      
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 30 seconds'));
      }, 30000);
      
      ibmdb.open(connStr, (err, connection) => {
        clearTimeout(timeout);
        if (err) {
          console.log("Connection error details:", {
            message: err.message,
            sqlcode: err.sqlcode,
            state: err.state
          });
          reject(err);
        } else {
          console.log("Connection successful!");
          resolve(connection);
        }
      });
    });

    // First check if schema exists
    const checkSchema = `SELECT SCHEMANAME FROM SYSCAT.SCHEMATA WHERE SCHEMANAME = '${TAB_SCHEMA}'`;
    const schemaExists = await new Promise((resolve, reject) => {
      conn.query(checkSchema, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.length > 0);
        }
      });
    });

    // Create schema only if it doesn't exist
    if (!schemaExists) {
      await new Promise((resolve, reject) => {
        conn.query(schema_settings, (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log("Schema created successfully");
            resolve(result);
          }
        });
      });
    } else {
      console.log("Schema already exists, continuing with table creation");
    }

    // Array of initialization queries for tables and views
    const tableQueries = [
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = '${TAB_PRODUCT_NAME}'`,
        create: table1_settings,
        name: "Product table"
      },
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = '${TAB_PACKING_NAME}'`,
        create: table2_settings,
        name: "Packing table"
      },
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = 'PACKING_PRODUCT'`,
        create: table3_settings,
        name: "Packing-Product relation table"
      },
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = '${TAB_PICKING_NAME}'`,
        create: table4_settings,
        name: "Picking table"
      },
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = 'PICKING_PACKING'`,
        create: table5_settings,
        name: "Picking-Packing relation table"
      },
      {
        check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${TAB_SCHEMA}' AND TABNAME = '${TAB_BARCODE_NAME}'`,
        create: table_barcode_settings,
        name: "Barcode table"
      },
      {
        check: `SELECT VIEWNAME FROM SYSCAT.VIEWS WHERE VIEWSCHEMA = '${TAB_SCHEMA}' AND VIEWNAME = '${VIEW_NAME}'`,
        create: view_settings,
        name: "Products view"
      }
    ];

    // Execute table creation queries
    for (const query of tableQueries) {
      try {
        // Check if table exists
        const exists = await new Promise((resolve, reject) => {
          conn.query(query.check, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.length > 0);
            }
          });
        });

        if (!exists) {
          await new Promise((resolve, reject) => {
            conn.query(query.create, (err, result) => {
              if (err) {
                reject(err);
              } else {
                console.log(`${query.name} created successfully`);
                resolve(result);
              }
            });
          });
        } else {
          console.log(`${query.name} already exists, skipping`);
        }
      } catch (error) {
        console.error(`Error processing ${query.name}:`, error);
        throw error;
      }
    }

    res.status(200).json({ 
      message: "Database initialization completed successfully",
      details: "All required database objects are ready"
    });

  } catch (error) {
    console.error("Error in init process:", {
      message: error.message,
      sqlcode: error.sqlcode,
      state: error.state,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: "Database initialization failed",
      details: error.message
    });
    
  } finally {
    if (conn) {
      try {
        await new Promise((resolve) => {
          conn.close((err) => {
            if (err) console.error("Error closing connection:", err);
            resolve();
          });
        });
        console.log("Connection closed");
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// OK
const openConnection = promisify(ibmdb.open);

app.get('/insert-demo-data', async (req, res) => {
  let conn;
  try {
    console.log("Attempting to connect: " + connStr);
    conn = await openConnection(connStr);
    console.log("Connected to: " + DATABASE);

    const fileStream = fs.createReadStream('./data.txt');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;

    for await (const line of rl) {
      lineCount++;
      if (lineCount === 1) continue; // Skip the header line
      
      console.log(`Processing line: ${line}`);
      
      const [
        Exercici_OF, Clase_OF, Series_OF, Num_doc_of, Codi_Producte, Descripcio,
        Tipus_embalatge, Codi_personal, Nom_personal, Largo, Ancho, Grueso,
        MP1, MP1_Descripcio, Ubicacio_1, Ubicacio_2, Ubicacio_3, Quantitat
      ] = line.split(/\s+/);

      try {
        // Insert product
        const insertProductQuery = `
          INSERT INTO ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} 
          (Codi_Producte, Descripcio, Tipus_embalatge, Codi_personal, Nom_personal, 
          Largo, Ancho, Grueso, MP1, MP1_Descripcio, Ubicacio_1, Ubicacio_2, Ubicacio_3, Quantitat)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await conn.query(insertProductQuery, [
          Codi_Producte, Descripcio, Tipus_embalatge, Codi_personal,
          Nom_personal, parseFloat(Largo), parseFloat(Ancho), parseFloat(Grueso),
          MP1, MP1_Descripcio, Ubicacio_1, Ubicacio_2, Ubicacio_3, parseInt(Quantitat)
        ]);
        console.log(`Inserted product: ${Codi_Producte}`);

        // Get the last inserted id
        const getProductIdQuery = `SELECT MAX(product_id) AS PRODUCT_ID FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}`;
        const [productIdResult] = await conn.query(getProductIdQuery);
        console.log(productIdResult);
        const product_id = productIdResult['PRODUCT_ID'];
        console.log(`Product id: ${product_id}`);

        // Insert a barcode
        const barcode = Math.floor(Math.random() * 1000000000000).toString();

        const insertBarcodeQuery = `
          INSERT INTO ${TAB_SCHEMA}.${TAB_BARCODE_NAME} 
          (barcode, id_product, Exercici_OF, Clase_OF, Series_OF, Num_doc_of)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await conn.query(insertBarcodeQuery, [barcode, product_id, Exercici_OF, Clase_OF, Series_OF, Num_doc_of]);
        console.log(`Inserted barcode: ${barcode}`);
      } catch (error) {
        console.log(`Error processing line ${lineCount}:`, error);
        // Decide if you want to continue processing or throw to stop the whole process
        // throw error; 
      }
    }

    console.log("Finished reading file");
    res.json({ message: "Data insertion process completed" });
  } catch (error) {
    console.log("Error in data insertion process:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Connection closed");
      } catch (err) {
        console.log("Error closing connection:", err);
      }
    }
  }
});

// OK
app.get('/get-products', (req, res) => {
  ibmdb.open(connStr, function (err, conn) {
    if (err) {
      console.log("Error:", err);
      return;
    }

    console.log("Connected to: " + DATABASE);

    let query = `SELECT * FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}`;

    conn.query(query, function (err, data) {
      if (err) {
        console.log("Error executing query:", err);
        conn.closeSync();
        return res.status(500).json({ error: err.message });
      }
    
      // console.log("Products in schema:", data);
      conn.close(function (err) {
        if (err) {
          console.log("Error closing connection:", err);
        } else {
          console.log('Connection closed successfully');
        }
      });

      res.status(200).json(data);
    });
  });
});

// OK
app.get('/get-barcodes', (req, res) => {
  ibmdb.open(connStr, function (err, conn) {
    if (err) {
      console.log("Error:", err);
      return;
    }

    console.log("Connected to: " + DATABASE);

    let query = `SELECT * FROM ${TAB_SCHEMA}.${TAB_BARCODE_NAME}`;

    conn.query(query, function (err, data) {
      if (err) {
        console.log("Error executing query:", err);
        conn.closeSync();
        return res.status(500).json({ error: err.message });
      }
    
      console.log("Barcodes in schema:", data);
      conn.close(function (err) {
        if (err) {
          console.log("Error closing connection:", err);
        } else {
          console.log('Connection closed successfully');
        }
      });

      res.status(200).json(data);
    });
  });
});

// OK
app.get('/get-view', (req, res) => {
  let conn;
  try {
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);

    let query = `SELECT * FROM ${TAB_SCHEMA}.${VIEW_NAME}`;

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

    let query = `SELECT * FROM ${TAB_SCHEMA}.${VIEW_NAME} WHERE barcode = ?`;
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

    let query = `SELECT DISTINCT NUM_DOC_OF FROM ${VIEW_NAME}`; //${TAB_SCHEMA}.${TAB_BARCODE_NAME}`;

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

// REVIEW
app.post('/add-picking', (req, res) => {
  let conn;
  try {
    let pickingData = req.body;
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);

    // Iniciar una transacción
    conn.beginTransactionSync();

    // Insertar el picking
    let query = `INSERT INTO ${TAB_SCHEMA}.${TAB_PICKING_NAME} (name) VALUES (?)`;
    conn.querySync(query, [pickingData[0].name || 'Unnamed Picking']);

    // Obtener el ID del picking recién insertado
    query = `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`;
    const [pickingIdResult] = conn.querySync(query);
    const pickingId = pickingIdResult.ID;

    for (const packing of pickingData) {
      // Insertar el packing
      query = `INSERT INTO ${TAB_SCHEMA}.${TAB_PACKING_NAME} (name, of_group) VALUES (?, ?)`;
      conn.querySync(query, [packing.name || 'Unnamed Packing', packing.of_group]);

      // Obtener el ID del packing recién insertado
      query = `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`;
      const [packingIdResult] = conn.querySync(query);
      const packingId = packingIdResult.ID;

      // Insertar la relación picking-packing
      query = `INSERT INTO ${TAB_SCHEMA}.PICKING_PACKING (id_picking, id_packing) VALUES (?, ?)`;
      conn.querySync(query, [pickingId, packingId]);

      // Insertar los productos del packing
      for (const product of packing.products) {
        // Verificar si el producto ya existe
        query = `SELECT product_id FROM ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} WHERE Codi_Producte = ?`;
        const productResult = conn.querySync(query, [product.CODI_PRODUCTE]);
        
        let productId;
        if (productResult.length === 0) {
          // Si el producto no existe, lo insertamos
          query = `INSERT INTO ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} 
                   (Codi_Producte, Descripcio, Tipus_embalatge, Codi_personal, Nom_personal, 
                   Largo, Ancho, Grueso, MP1, MP1_Descripcio, Ubicacio_1, Ubicacio_2, Ubicacio_3, Quantitat) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          conn.querySync(query, [
            product.CODI_PRODUCTE, product.DESCRIPCIO, product.TIPUS_EMBALATGE, 
            product.CODI_PERSONAL, product.NOM_PERSONAL, product.LARGO, product.ANCHO, 
            product.GRUESO, product.MP1, product.MP1_DESCRIPCIO, product.UBICACIO_1, 
            product.UBICACIO_2, product.UBICACIO_3, product.QUANTITAT
          ]);

          // Obtener el ID del producto recién insertado
          query = `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`;
          const [productIdResult] = conn.querySync(query);
          productId = productIdResult.ID;
        } else {
          productId = productResult[0].PRODUCT_ID;
        }

        // Insertar la relación packing-producto
        query = `INSERT INTO ${TAB_SCHEMA}.PACKING_PRODUCT (id_packing, product_id, quantity) VALUES (?, ?, ?)`;
        conn.querySync(query, [packingId, productId, product.QUANTITAT]);
      }
    }

    // Confirmar la transacción
    conn.commitTransactionSync();

    res.status(200).json({ message: "Picking added successfully", pickingId: pickingId });
  } catch (error) {
    console.log("Error in add-picking process:", error);
    if (conn) {
      try {
        conn.rollbackTransactionSync();
      } catch (rollbackError) {
        console.log("Error rolling back transaction:", rollbackError);
      }
    }
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

// REVIEW
app.get('/get-pickings', (req, res) => {
  // rerturns pickings with the packings and the products
  let conn;
  try {
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);

    let query = `
      SELECT * FROM ${TAB_SCHEMA}.${TAB_PICKING_NAME}
      JOIN ${TAB_SCHEMA}.PICKING_PACKING ON ${TAB_SCHEMA}.${TAB_PICKING_NAME}.id_picking = ${TAB_SCHEMA}.PICKING_PACKING.id_picking
      JOIN ${TAB_SCHEMA}.${TAB_PACKING_NAME} ON ${TAB_SCHEMA}.PICKING_PACKING.id_packing = ${TAB_SCHEMA}.${TAB_PACKING_NAME}.id_packing
      JOIN ${TAB_SCHEMA}.PACKING_PRODUCT ON ${TAB_SCHEMA}.${TAB_PACKING_NAME}.id_packing = ${TAB_SCHEMA}.PACKING_PRODUCT.id_packing
      JOIN ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} ON ${TAB_SCHEMA}.PACKING_PRODUCT.product_id = ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}.product_id
    `;
    const data = conn.querySync(query);
    console.log("Data in view:", data);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error getting pickings:", error);
    res.status(500).json({ error: error.message });
  }
});


// NOT USED
// REVIEW
// let pickings = [];
// app.post('/add-picking', (req, res) => {
//   let data = {};
//   data["id"] = pickings.length;
//   data["packings"] = req.body;
//   console.log(req)
//   pickings.push(data);
//   res.json(data);
//   res.send('Picking added');
// });
// REVIEW

app.get('/delete-picking:id', (req, res) => {
  const id = req.params.id;
  pickings = pickings.filter(picking => picking.id !== id);
  res.send('Picking deleted');
});

app.post('/update-picking:id', (req, res) => {
  const id = req.params.id;
  const new_picking = req.body;
  pickings = pickings.map(picking => (picking.id === id ? new_picking : picking));
  res.send('Picking updated');
});

app.get('/get-pickings', (req, res) => {
  // Get pickings from the database, return a json with pickings + packings + products
  let conn;
  try {
    console.log("Attempting to connect: " + connStr);
    conn = ibmdb.openSync(connStr);
    console.log("Connected to: " + DATABASE);

    let query = `
      SELECT * FROM ${TAB_SCHEMA}.${TAB_PICKING_NAME} 
      JOIN ${TAB_SCHEMA}.${TAB_PACKING_NAME} ON ${TAB_SCHEMA}.${TAB_PICKING_NAME}.id_packing = ${TAB_SCHEMA}.${TAB_PACKING_NAME}.id_packing
      JOIN ${TAB_SCHEMA}.${TAB_PRODUCT_NAME} ON ${TAB_SCHEMA}.${TAB_PACKING_NAME}.id_product = ${TAB_SCHEMA}.${TAB_PRODUCT_NAME}.product_id
    `;

    const data = conn.querySync(query);
    console.log("Data in view:", data);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error getting pickings:", error);
    res.status(500).json({ error: error.message });
  }
});

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