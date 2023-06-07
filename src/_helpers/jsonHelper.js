class JsonHelper {
  constructor() {

  }

  jsonPretty = json => {
    console.log('!!!!!!!!!!!1', json)
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

}

export default JsonHelper
