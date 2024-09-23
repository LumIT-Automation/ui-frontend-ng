// tableUtils.js

/*
Funzione: getColumnSearchProps
Questa funzione restituisce un oggetto che contiene la configurazione necessaria per applicare un filtro di ricerca su una colonna specifica di una tabella. Viene usata spesso con antd per personalizzare il comportamento del filtro su ogni colonna.

Parametri:
dataIndex: L'indice dei dati nella colonna (il nome del campo da cercare).
searchInput: Un riferimento (useRef) all'input del campo di ricerca.
handleSearch: Una funzione per gestire l'evento di ricerca.
handleReset: Una funzione per gestire il reset del campo di ricerca.
searchText: Il testo corrente cercato.
searchedColumn: La colonna in cui si sta effettuando la ricerca.
setSearchText: Una funzione per aggiornare il testo cercato.
setSearchedColumn: Una funzione per aggiornare la colonna cercata.
Restituisce un oggetto con le seguenti proprietà:
filterDropdown: Questo rende il menu a discesa che compare quando si clicca sull'icona di filtro accanto al titolo della colonna.

Visualizza un input di ricerca.
Un pulsante per avviare la ricerca.
Un pulsante per resettare il filtro.
Ecco cosa fa:

setSelectedKeys: Imposta i valori inseriti nell'input di ricerca.
confirm: Conferma il filtro e chiude il menu a tendina.
clearFilters: Resetta i filtri applicati.
filterIcon: Questa funzione personalizza l'icona del filtro (con un'icona di una lente SearchOutlined), che cambia colore quando è attiva.

onFilter: Viene utilizzato per applicare il filtro sui dati della colonna. Controlla se il valore cercato (value) è presente nel record della tabella:

Cerca in una stringa semplice (se dataIndex è una stringa).
Cerca nei campi annidati (se dataIndex è un array, es. ['privileges', 'privilege']).
onFilterDropdownVisibleChange: Quando il menu a tendina diventa visibile, seleziona automaticamente il contenuto dell'input di ricerca dopo 100 ms, in modo che l'utente possa subito iniziare a scrivere.

render: Personalizza il modo in cui viene visualizzato il testo della colonna. Se la colonna corrente è la colonna cercata (searchedColumn), evidenzia il testo trovato usando Highlighter, che colora il testo trovato con uno sfondo giallo.

Funzione: handleSearch
Questa funzione viene eseguita quando l'utente clicca su "Search" o preme Invio nell'input di ricerca.

Parametri:
selectedKeys: Contiene i valori inseriti nel campo di ricerca.
confirm: Chiude il menu del filtro e applica la ricerca.
dataIndex: Identifica quale colonna è stata cercata.
setSearchText: Aggiorna lo stato con il testo cercato.
setSearchedColumn: Aggiorna lo stato per indicare in quale colonna è stata effettuata la ricerca.
Cosa fa:
Conferma il filtro.
Imposta il testo cercato nello stato.
Imposta quale colonna è stata cercata.
Funzione: handleReset
Questa funzione viene eseguita quando l'utente clicca su "Reset".

Parametri:
clearFilters: Resetta tutti i filtri.
confirm: Chiude il menu e conferma l'azione di reset.
setSearchText: Resetta il valore del testo cercato a una stringa vuota.
Cosa fa:
Pulisce i filtri correnti.
Conferma il reset.
Resetta il testo cercato.
Utilizzo Complessivo
Queste funzioni sono progettate per aggiungere funzionalità di ricerca e reset sui dati di una tabella. Il getColumnSearchProps è particolarmente utile per rendere personalizzabile la logica del filtro direttamente dentro ogni colonna della tabella, permettendo a ciascuna colonna di avere i propri criteri di ricerca.



...getColumnSearchProps(
  'name', 
  searchInput, 
  (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
  (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
  searchText, 
  searchedColumn, 
  setSearchText, 
  setSearchedColumn
),

Questa chiamata utilizza la funzione getColumnSearchProps per applicare una funzionalità di ricerca su una specifica colonna di una tabella. Di seguito analizziamo ogni argomento passato alla funzione.

1. 'name' (il dataIndex)
Questo è il nome della proprietà della colonna a cui si applica il filtro di ricerca, in questo caso la colonna name.
dataIndex è la chiave che corrisponde alla colonna nel dataset della tabella.
2. searchInput
Questo è un riferimento (useRef) all'elemento Input che l'utente utilizza per scrivere la query di ricerca.
Viene passato alla funzione in modo che possa essere controllato e, ad esempio, selezionato automaticamente quando si apre il filtro.
3. (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn)
Questa è una funzione anonima (arrow function) passata come callback, che viene eseguita quando l'utente effettua una ricerca.

I parametri della funzione anonima:

selectedKeys: Un array con i valori inseriti nel campo di ricerca.
confirm: Funzione che conferma il filtro e chiude il menu del filtro.
dataIndex: La colonna in cui è stata fatta la ricerca.
Dentro la funzione, viene chiamata handleSearch, che è la vera funzione di ricerca. A questa funzione vengono passati:

selectedKeys: Il valore della ricerca.
confirm: Per confermare il filtro.
dataIndex: La colonna dove si sta cercando.
setSearchText: Per aggiornare lo stato del testo cercato.
setSearchedColumn: Per aggiornare quale colonna è stata cercata.
La funzione handleSearch aggiornerà il testo cercato nello stato e indicherà che la colonna name è stata filtrata.

4. (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText)
Anche questa è una funzione anonima passata come callback, che viene eseguita quando l'utente clicca sul pulsante "Reset" per pulire il filtro di ricerca.
I parametri:
clearFilters: Una funzione che resetta i filtri.
confirm: Per chiudere e confermare la finestra di filtro.
La funzione handleReset viene chiamata, e le viene passato:
clearFilters: Per resettare i filtri.
confirm: Per chiudere il menu del filtro.
setSearchText: Per resettare il testo cercato nello stato.
5. searchText
Questo è lo stato che contiene il testo attualmente cercato.
Viene usato dalla funzione getColumnSearchProps per evidenziare il testo trovato nella colonna con il componente Highlighter.
6. searchedColumn
Questo è lo stato che memorizza la colonna in cui è stata effettuata l'ultima ricerca.
Serve per sapere se evidenziare i risultati nella colonna corrente.
7. setSearchText
Questa è una funzione che aggiorna lo stato searchText, e viene usata per cambiare il valore cercato quando l'utente inserisce una query o resetta la ricerca.
8. setSearchedColumn
Questa è una funzione che aggiorna lo stato searchedColumn, e viene usata per indicare quale colonna è stata cercata.
Riepilogo:
La funzione getColumnSearchProps genera le proprietà di ricerca per la colonna name.
Le callback passate a handleSearch e handleReset gestiscono il comportamento della ricerca e del reset.
Lo stato searchText e searchedColumn, insieme alle loro funzioni di aggiornamento, permettono di tracciare il testo cercato e la colonna corrente in cui è stata effettuata la ricerca.
Questo permette alla colonna name di avere una ricerca filtrata, con la possibilità di evidenziare i risultati e resettare il filtro quando necessario.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';

export const getColumnSearchProps = (
  dataIndex, 
  searchInput, 
  handleSearch, 
  handleReset, 
  searchText, 
  searchedColumn, 
  setSearchText, 
  setSearchedColumn
) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8 }}>
      <Input
        ref={searchInput}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  onFilter: (value, record) => {
    try {
      if (typeof dataIndex === 'string') {
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
      } else if (Array.isArray(dataIndex)) {
        return record[dataIndex[0]][dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase());
      }
    } catch (error) {}
  },
  onFilterDropdownVisibleChange: (visible) => {
    if (visible) {
      setTimeout(() => searchInput.current.select(), 100);
    }
  },
  render: (text) =>
    searchedColumn === dataIndex ? (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    ) : (
      text
    ),
});

export const handleSearch = (selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn) => {
  confirm();
  setSearchText(selectedKeys[0]);
  setSearchedColumn(dataIndex);
};

export const handleReset = (clearFilters, confirm, setSearchText) => {
  clearFilters();
  confirm();
  setSearchText('');
};
