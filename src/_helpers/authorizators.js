

class Authorizators {

  isObjectEmpty = a => {
    console.log(a)
    if (a) {
      if ('any' in a ) {
        return true
      }
      if (Object.keys(a).length === 0) {
        return false
      }
      else {
        return true
      }
    }
  }

}

export default Authorizators
