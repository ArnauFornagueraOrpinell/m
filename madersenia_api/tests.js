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
  