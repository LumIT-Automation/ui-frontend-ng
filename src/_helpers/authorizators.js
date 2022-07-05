

class Authorizators {

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
