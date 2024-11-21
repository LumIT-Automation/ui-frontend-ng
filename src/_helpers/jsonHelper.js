class JsonHelper {

  processJSON = input => {
    try {
      // Prova a fare il parsing
      const parsed = JSON.parse(input);

      // Controlla che sia un oggetto o un array
      if (typeof parsed === "object" && parsed !== null) {
          //return JSON.stringify(parsed, null, 2); // Ritorna il JSON formattato
          return parsed
      } else {
          return null; // Non è un oggetto o un array
      }
    } catch (error) {
        // Se il parsing fallisce, non è un JSON valido
        return null;
    }
}

  jsonPretty = json => {
    let str = ''
    try {
      str = JSON.stringify(json, null, 2)
      return str
    }
    catch (error) {
      console.log(error)
      return '{malformed JSON}'
    }
  }

  isJsonString = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return {status: 'error', message: e.message};
    }
    return {status: 'ok'};
  }

}

export default JsonHelper
