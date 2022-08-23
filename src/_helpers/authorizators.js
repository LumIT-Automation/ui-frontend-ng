

class Authorizators {

  isSuperAdmin = a => {
    if (a) {
      try {
        for (const [key, value] of Object.entries(a) ) {
          //if ( (key === 'any') || ('any' in value && value.any === 'any') ) {
          if (value.any) {
            console.log('true')
            return true
          }
        }
        console.log('false')
        return false
      }
      catch (error) {
        console.log('catch false')
        return false
      }
    }
  }

  isObjectEmpty = a => {
    try {
      if (a) {
        if ('any' in a && a.any === 'any') {
          return true
        }
        else if (Object.keys(a).length > 0) {
          return true
        }
      }
      return false
    }
    catch (error) {
      return false
    }
  }

}

export default Authorizators
