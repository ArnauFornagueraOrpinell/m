const express = require('express');
const router = express.Router();

require('dotenv').config();
const ibmdb = require('ibm_db');




const CUSTOM_DATABASE = process.env.CUSTOM_DATABASE;
const CUSTOM_HOSTNAME = process.env.CUSTOM_DB_HOSTNAME;
const CUSTOM_UID = process.env.CUSTOM_DB_UID;
const CUSTOM_PWD = process.env.CUSTOM_DB_PWD;
const CUSTOM_TAB_SCHEMA = process.env.CUSTOM_TAB_SCHEMA;

const TAB_PRODUCT_NAME = process.env.TAB_PRODUCT_NAME;
const TAB_PACKING_NAME = process.env.TAB_PACKING_NAME;
const TAB_PICKING_NAME = process.env.TAB_PICKING_NAME;
const TAB_BARCODE_NAME = process.env.TAB_BARCODE_NAME;
const CUSTOM_VIEW_NAME = process.env.CUSTOM_VIEW_NAME;
const NODE_PORT = process.env.NODE_PORT;
const DB_PORT = process.env.DB_PORT;


const table1_settings = `
CREATE TABLE ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME} (
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
CREATE TABLE ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME} (
  PACKING_ID BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  NAME VARCHAR(100),
  OF_GROUP VARCHAR(100)
);`;

const table3_settings = `
CREATE TABLE ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT (
  PACKING_ID BIGINT NOT NULL,
  PRODUCT_ID BIGINT NOT NULL,
  QUANTITY INT NOT NULL,
  PRIMARY KEY (PACKING_ID, PRODUCT_ID),
  FOREIGN KEY (PACKING_ID) REFERENCES ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}(PACKING_ID),
  FOREIGN KEY (PRODUCT_ID) REFERENCES ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME}(PRODUCT_ID)
);`;

const table4_settings = `
CREATE TABLE ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME} (
  PICKING_ID BIGINT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
  NAME VARCHAR(100)
);`;

const table5_settings = `
CREATE TABLE ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING (
  PICKING_ID BIGINT NOT NULL,
  PACKING_ID BIGINT NOT NULL,
  PRIMARY KEY (PICKING_ID, PACKING_ID),
  FOREIGN KEY (PICKING_ID) REFERENCES ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}(PICKING_ID),
  FOREIGN KEY (PACKING_ID) REFERENCES ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}(PACKING_ID)
);`;



const customConnStr = `DATABASE=${CUSTOM_DATABASE};` +
`HOSTNAME=${CUSTOM_HOSTNAME};` +
`UID=${CUSTOM_UID};` +
`PWD=${CUSTOM_PWD};` +
`PORT=${DB_PORT};` +
`PROTOCOL=TCPIP;` +
`AUTHENTICATION=SERVER;` +  // Especificar autenticación
`CONNECTTIMEOUT=30;` +      // Timeout de conexión en segundos
`QUERYTIMEOUT=180;` +       // Timeout de consultas
`CURRENTSCHEMA=${CUSTOM_TAB_SCHEMA};`; // Schema por defecto


function dbMiddleware(req, res, next) {
    let conn;
    try {
      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " + CUSTOM_DATABASE);
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



router.get('/init', dbMiddleware, dbCloseMiddleware, async (req, res) => {
    let conn;
    try {
      console.log("Connection string:", customConnStr);
      
      conn = await new Promise((resolve, reject) => {
        console.log("Initiating connection...");
        
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 30 seconds'));
        }, 30000);
        
        ibmdb.open(customConnStr, (err, connection) => {
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
      const checkSchema = `SELECT SCHEMANAME FROM SYSCAT.SCHEMATA WHERE SCHEMANAME = '${CUSTOM_TAB_SCHEMA}'`;
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
    //   if (!schemaExists) {
    //     await new Promise((resolve, reject) => {
    //       conn.query(schema_settings, (err, result) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           console.log("Schema created successfully");
    //           resolve(result);
    //         }
    //       });
    //     });
    //   } else {
    //     console.log("Schema already exists, continuing with table creation");
    //   }
  
      // Array of initialization queries for tables and views
      const tableQueries = [
        {
          check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${CUSTOM_TAB_SCHEMA}' AND TABNAME = '${TAB_PRODUCT_NAME}'`,
          create: table1_settings,
          name: "Product table"
        },
        {
          check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${CUSTOM_TAB_SCHEMA}' AND TABNAME = '${TAB_PACKING_NAME}'`,
          create: table2_settings,
          name: "Packing table"
        },
        {
          check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${CUSTOM_TAB_SCHEMA}' AND TABNAME = 'PACKING_PRODUCT'`,
          create: table3_settings,
          name: "Packing-Product relation table"
        },
        {
          check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${CUSTOM_TAB_SCHEMA}' AND TABNAME = '${TAB_PICKING_NAME}'`,
          create: table4_settings,
          name: "Picking table"
        },
        {
          check: `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = '${CUSTOM_TAB_SCHEMA}' AND TABNAME = 'PICKING_PACKING'`,
          create: table5_settings,
          name: "Picking-Packing relation table"
        },
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

  
// REVIEW
router.post('/add-picking', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
        let pickingData = req.body;
        console.log("Attempting to connect: " + customConnStr);
        conn = ibmdb.openSync(customConnStr);
        console.log("Connected to: " + CUSTOM_DATABASE);

        // Start transaction
        conn.beginTransactionSync();

        // Insert picking
        let query = `INSERT INTO ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME} (NAME) VALUES (?)`;
        conn.querySync(query, [pickingData[0]?.NAME || 'Unnamed Picking']);

        // Get picking ID
        query = `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`;
        const [pickingIdResult] = conn.querySync(query);
        const pickingId = pickingIdResult.ID;

        for (const packing of pickingData) {
            // Skip empty packings
            if (!packing || Object.keys(packing).length === 0) {
                continue;
            }

            // Insert packing
            query = `INSERT INTO ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME} (NAME, OF_GROUP) VALUES (?, ?)`;
            conn.querySync(query, [packing?.NAME || 'Unnamed Packing', packing?.OF_GROUP || '']);

            // Get packing ID
            query = `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`;
            const [packingIdResult] = conn.querySync(query);
            const packingId = packingIdResult.ID;

            // Insert picking-packing relation
            query = `INSERT INTO ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING (PICKING_ID, PACKING_ID) VALUES (?, ?)`;
            conn.querySync(query, [pickingId, packingId]);

            // Handle products
            if (packing.products && Array.isArray(packing.products)) {
                for (const product of packing.products) {
                    if (!product) continue;

                    let productId;
                    
                    // Check if product exists
                    const checkProduct = conn.querySync(
                        `SELECT PRODUCT_ID FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME} WHERE CODI_PRODUCTE = ?`,
                        [product.CODI_PRODUCTE]
                    );

                    if (checkProduct.length === 0) {
                        // Product doesn't exist, insert it
                        const insertProductQuery = `
                            INSERT INTO ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME} (
                                CODI_PRODUCTE, DESCRIPCIO, TIPUS_EMBALATGE, 
                                CODI_PERSONAL, NOM_PERSONAL, LARGO, 
                                ANCHO, GRUESO, MP1, MP1_DESCRIPCIO, 
                                UBICACIO_1, UBICACIO_2, UBICACIO_3, QUANTITAT
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        conn.querySync(insertProductQuery, [
                            product.CODI_PRODUCTE || '',
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
                            product.QUANTITAT || 0
                        ]);

                        // Get the new product ID
                        const [newProductResult] = conn.querySync(
                            `SELECT IDENTITY_VAL_LOCAL() AS ID FROM SYSIBM.SYSDUMMY1`
                        );
                        productId = newProductResult.ID;
                    } else {
                        productId = checkProduct[0].PRODUCT_ID;
                    }

                    // Insert packing-product relation with quantity
                    const quantity = typeof product.QUANTITAT === 'number' ? product.QUANTITAT : 0;
                    conn.querySync(
                        `INSERT INTO ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT (PACKING_ID, PRODUCT_ID, QUANTITY) VALUES (?, ?, ?)`,
                        [packingId, productId, quantity]
                    );
                }
            }
        }

        // Commit transaction
        conn.commitTransactionSync();
        res.status(200).json({ 
            message: "Picking and all related data added successfully", 
            pickingId: pickingId 
        });

    } catch (error) {
        console.error("Error in add-picking process:", error);
        if (conn) {
            try {
                conn.rollbackTransactionSync();
            } catch (rollbackError) {
                console.error("Error rolling back transaction:", rollbackError);
            }
        }
        res.status(500).json({ error: error.message });
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


  // REVIEW
router.get('/delete-picking:id', dbMiddleware, dbCloseMiddleware, (req, res) => {
    const id = req.params.id;
    pickings = pickings.filter(picking => picking.id !== id);
    res.send('Picking deleted');
});
  
router.post('/update-picking:id', dbMiddleware, dbCloseMiddleware, (req, res) => {
    const id = req.params.id;
    const new_picking = req.body;
    pickings = pickings.map(picking => (picking.id === id ? new_picking : picking));
    res.send('Picking updated');
});

router.get('/get-pickings', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
        console.log("Attempting to connect: " + customConnStr);
        conn = ibmdb.openSync(customConnStr);
        console.log("Connected to: " + CUSTOM_DATABASE);

        // First, get all pickings
        const pickings = conn.querySync(`
            SELECT PICKING_ID, NAME as PICKING_NAME
            FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
        `);

        // For each picking, get its packings and products
        const result = pickings.map(picking => {
            // Get packings for this picking
            const packings = conn.querySync(`
                SELECT p.PACKING_ID, p.NAME as PACKING_NAME, p.OF_GROUP
                FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME} p
                JOIN ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp ON p.PACKING_ID = pp.PACKING_ID
                WHERE pp.PICKING_ID = ?
            `, [picking.PICKING_ID]);

            // For each packing, get its products
            const packingsWithProducts = packings.map(packing => {
                const products = conn.querySync(`
                    SELECT 
                        prod.*,
                        pp.QUANTITY as PACK_QUANTITY
                    FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME} prod
                    JOIN ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT pp 
                        ON prod.PRODUCT_ID = pp.PRODUCT_ID
                    WHERE pp.PACKING_ID = ?
                `, [packing.PACKING_ID]);

                return {
                    ...packing,
                    products: products
                };
            });

            return {
                picking_id: picking.PICKING_ID,
                picking_name: picking.PICKING_NAME,
                packings: packingsWithProducts
            };
        });

        console.log("Data retrieved:", result);
        res.status(200).json(result);
    } catch (error) {
        console.log("Error getting pickings:", error);
        res.status(500).json({ error: error.message });
    }
});

  router.get('/get-pickings-table', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " +  CUSTOM_DATABASE);
  
      let query = `
        SELECT * 
        FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
      `;
  
      const data = conn.querySync(query);
      console.log("Data in view:", data);
  
      res.status(200).json(data);
    } catch (error) {
      console.log("Error getting pickings:", error);
      res.status(500).json({ error: error.message });
    }
});

router.get('/get-packings-table', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " +  CUSTOM_DATABASE);
  
      let query = `
        SELECT * 
        FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME}
      `;
  
      const data = conn.querySync(query);
      console.log("Data in view:", data);
  
      res.status(200).json(data);
    } catch (error) {
      console.log("Error getting packings:", error);
      res.status(500).json({ error: error.message });
    }
});

router.get('/get-products-table', dbMiddleware, dbCloseMiddleware, (req, res) => {
    let conn;
    try {
      console.log("Attempting to connect: " + customConnStr);
      conn = ibmdb.openSync(customConnStr);
      console.log("Connected to: " +  CUSTOM_DATABASE);
  
      let query = `
        SELECT * 
        FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME}
      `;
  
      const data = conn.querySync(query);
      console.log("Data in view:", data);
  
      res.status(200).json(data);
    } catch (error) {
      console.log("Error getting products:", error);
      res.status(500).json({ error: error.message });
    }
});


// https://192.168.1.158:3002/page?page=1&length=2 
router.get('/page', dbMiddleware, dbCloseMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const length = parseInt(req.query.length) || 10;
    
    let conn;
    try {
        console.log("Attempting to connect: " + customConnStr);
        conn = ibmdb.openSync(customConnStr);
        console.log("Connected to: " + CUSTOM_DATABASE);

        // First get total count for pagination
        const countQuery = `
            SELECT COUNT(*) AS TOTAL 
            FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
        `;
        const [totalResult] = conn.querySync(countQuery);
        const total = totalResult.TOTAL;
        const totalPages = Math.ceil(total / length);

        // Get paginated pickings
        const pickingsQuery = `
            SELECT PICKING_ID, NAME as PICKING_NAME 
            FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PICKING_NAME}
            ORDER BY PICKING_ID DESC
            OFFSET ${(page - 1) * length} ROWS
            FETCH FIRST ${length} ROWS ONLY
        `;
        const pickings = conn.querySync(pickingsQuery);

        // If no pickings found, return empty result
        if (!pickings || !Array.isArray(pickings) || pickings.length === 0) {
            return res.status(200).json({
                data: [],
                totalPages: totalPages,
                currentPage: page,
                totalItems: total
            });
        }

        // For each picking, get its packings
        const result = pickings.map(picking => {
            // Get packings for this picking
            const packingsQuery = `
                SELECT 
                    p.PACKING_ID,
                    p.NAME as PACKING_NAME,
                    p.OF_GROUP
                FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PACKING_NAME} p
                JOIN ${CUSTOM_TAB_SCHEMA}.PICKING_PACKING pp 
                    ON p.PACKING_ID = pp.PACKING_ID
                WHERE pp.PICKING_ID = ?
            `;
            const packings = conn.querySync(packingsQuery, [picking.PICKING_ID]);

            // For each packing, get its products
            const packingsWithProducts = packings.map(packing => {
                const productsQuery = `
                    SELECT 
                        prod.*,
                        pp.QUANTITY as PACK_QUANTITY
                    FROM ${CUSTOM_TAB_SCHEMA}.${TAB_PRODUCT_NAME} prod
                    JOIN ${CUSTOM_TAB_SCHEMA}.PACKING_PRODUCT pp 
                        ON prod.PRODUCT_ID = pp.PRODUCT_ID
                    WHERE pp.PACKING_ID = ?
                `;
                const products = conn.querySync(productsQuery, [packing.PACKING_ID]);

                return {
                    ...packing,
                    products: products || []
                };
            });

            return {
                picking_id: picking.PICKING_ID,
                picking_name: picking.PICKING_NAME,
                packings: packingsWithProducts || []
            };
        });

        // Return paginated response
        res.status(200).json({
            data: result,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total
        });

    } catch (error) {
        console.error("Error in paginated pickings:", error);
        res.status(500).json({ 
            error: error.message,
            details: "Error fetching paginated pickings"
        });
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
  
  


module.exports = router;
