class JsonHelper {

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
