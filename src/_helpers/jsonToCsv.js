class JsonToCsvConverter {
  /**
   * Converte un oggetto o un array di oggetti JSON in una stringa CSV.
   * Assumendo che se l'input è un array, ogni elemento sia un record con una struttura simile.
   * Le liste annidate vengono appiattite in colonne numerate (es. 'items_0_name').
   * L'ordine delle colonne CSV rispetta l'ordine delle chiavi nel JSON originale per le proprietà radice,
   * e raggruppa le colonne con prefissi e indici simili.
   *
   * @param {object|Array<object>} jsonData - L'oggetto o l'array di oggetti JSON da convertire.
   * @returns {string} La stringa CSV risultante, o una stringa vuota in caso di input non valido.
   */
  convertToCsv(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      console.error("Invalid input: the argument must be an object or an array.");
      return "";
    }

    let dataToProcess = [];
    if (Array.isArray(jsonData)) {
      dataToProcess = jsonData;
    } else {
      // Se è un singolo oggetto, lo avvolgiamo in un array per uniformità
      dataToProcess = [jsonData];
    }

    if (dataToProcess.length === 0) {
      console.warn("No data to convert. Returning empty CSV.");
      return "";
    }

    const outputRows = [];
    // Mappa per mantenere l'ordine delle chiavi principali e raccogliere le loro sotto-chiavi
    // { "uid": ["uid"], "name": ["name"], "ipv4s": ["ipv4s_0", "ipv4s_1"], "services": ["services_0_type", "services_0_port", ...] }
    const headerGroups = new Map();

    // Funzione ricorsiva per appiattire un singolo oggetto per una riga CSV
    const flattenObject = (obj, prefix = '', currentRow = {}) => {
      // Se è la prima volta che chiamiamo flattenObject per un oggetto di livello superiore,
      // usiamo Object.keys per ottenere l'ordine delle chiavi originali.
      const keys = prefix === '' ? Object.keys(obj) : Object.keys(obj);

      for (const key of keys) { // Ora iteriamo sull'ordine delle chiavi
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const currentKeyPath = prefix ? `${prefix}${key}` : key;
          const rootKey = currentKeyPath.split('_')[0]; // La chiave di livello più alto (es. uid, ipv4s)

          // Assicurati che la chiave radice esista nella mappa dei gruppi di intestazioni
          if (!headerGroups.has(rootKey)) {
            headerGroups.set(rootKey, []);
          }

          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              const indexedKeyPath = `${currentKeyPath}_${index}`;
              if (typeof item === 'object' && item !== null) {
                flattenObject(item, `${indexedKeyPath}_`, currentRow);
              } else {
                currentRow[indexedKeyPath] = item;
                // Aggiungi la chiave alla lista del suo gruppo, se non già presente
                if (!headerGroups.get(rootKey).includes(indexedKeyPath)) {
                  headerGroups.get(rootKey).push(indexedKeyPath);
                }
              }
            });
          } else if (typeof value === 'object' && value !== null) {
            flattenObject(value, `${currentKeyPath}_`, currentRow);
          } else {
            currentRow[currentKeyPath] = value;
            // Aggiungi la chiave alla lista del suo gruppo, se non già presente
            if (!headerGroups.get(rootKey).includes(currentKeyPath)) {
                headerGroups.get(rootKey).push(currentKeyPath);
            }
          }
        }
      }
    };

    // Appiattisci ogni oggetto nel dataToProcess per formare le righe e popolare headerGroups
    dataToProcess.forEach(item => {
      const rowData = {};
      flattenObject(item, '', rowData);
      outputRows.push(rowData);
    });

    // --- Costruzione dell'ordine finale delle intestazioni ---
    const finalHeaders = [];

    // Ordina le chiavi all'interno di ogni gruppo e poi uniscile
    for (const [rootKey, subHeaders] of headerGroups) {
      // Ordina le sotto-intestazioni di questo gruppo
      subHeaders.sort((a, b) => {
        // Funzione per estrarre la parte numerica e la parte testuale per l'ordinamento
        const parseHeader = (header) => {
          const parts = header.split('_');
          let numericPart = -1;
          let textPart = '';

          // Cerca l'indice numerico nel percorso (es. ipv4s_0, services_1_port)
          let indexFound = -1;
          for(let i = 0; i < parts.length; i++) {
            if (!isNaN(parseInt(parts[i], 10)) && (i + 1 < parts.length || i === parts.length - 1)) {
              // Se è un numero e non è l'ultimo pezzo di un prefisso, es. 'services_0'
              // Oppure se è l'ultimo pezzo e non c'è altro dopo (es. 'ipv4s_0')
              if (parts[i].length === String(parseInt(parts[i], 10)).length) { // Evita casi come 'abc123_0'
                 numericPart = parseInt(parts[i], 10);
                 indexFound = i;
                 break;
              }
            }
          }
          
          if (indexFound !== -1) {
            textPart = parts.slice(indexFound + 1).join('_'); // Parte dopo l'indice (es. 'type', 'port')
            if (textPart === '') { // Se non c'è nulla dopo l'indice (es. 'ipv4s_0')
                textPart = parts.slice(0, indexFound).join('_'); // Usa il prefisso come parte testuale principale
            }
          } else {
            textPart = header; // Se non c'è indice numerico, usa l'intestazione completa
          }

          return { numericPart, textPart };
        };

        const parsedA = parseHeader(a);
        const parsedB = parseHeader(b);

        // 1. Ordina per la parte numerica (l'indice)
        if (parsedA.numericPart !== parsedB.numericPart) {
          return parsedA.numericPart - parsedB.numericPart;
        }

        // 2. Se la parte numerica è la stessa, ordina alfabeticamente per la parte testuale
        return parsedA.textPart.localeCompare(parsedB.textPart);
      });
      
      // Aggiungi le intestazioni ordinate di questo gruppo alle intestazioni finali
      finalHeaders.push(...subHeaders);
    }
    
    // Costruisci la stringa CSV
    let csv = finalHeaders.join(',') + '\n'; // Riga delle intestazioni

    outputRows.forEach(row => {
      const values = finalHeaders.map(header => {
        let value = row[header];
        if (value === undefined || value === null) {
          value = ''; // Gestisce i valori nulli/indefiniti
        } else if (typeof value === 'string') {
          // Escapa le virgolette e aggiunge virgolette se il valore contiene virgole o nuove righe
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('\n')) {
            value = `"${value}"`;
          }
        }
        return value;
      });
      csv += values.join(',') + '\n'; // Riga dei valori
    });

    return csv;
  }
}

export default JsonToCsvConverter;