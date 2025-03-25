class Authorizators {

  isAuthorized = (authorizations, vendor, key) => {
    
    try {
      let obj = Object.assign({}, authorizations[vendor])
      if (authorizations && vendor && key) {
        if (key in obj || 'any' in obj) {
          return true
        }
        else {
          return false
        }
      }
      else if (authorizations && vendor) {
        if (vendor in authorizations && Object.keys(obj).length > 0) {
          return true
        }
        else {
          return false
        }
      }
      else {
        return false
      }
    }
    catch (error){
      console.log(error)
    }
  }

  isSuperAdmin = (a) => {
    console.log(a)
    if (a) {
      try {
        for (const value of Object.values(a) ) {
          if (Array.isArray(value.any) && value.any.length > 0) {
            return true;
          }
        }
        return false
      }
      catch (error) {
        return false
      }
    }
  }

}

export default Authorizators
