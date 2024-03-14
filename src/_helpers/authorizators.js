

class Authorizators {

  isAuthorized = (authorizations, vendor, key) => {
    
    try {
      let obj = Object.assign({}, authorizations[vendor])
      console.log(obj)
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

  isSuperAdmin = a => {
    if (a) {
      try {
        for (const value of Object.values(a) ) {
          if (value.any) {
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

  workflowRemoveHost = list => {
    try {
      let resp
      if (list) {
        list.exec.forEach((item, i) => {
          if (item.workflow_name === "checkpoint_remove_host") {
            resp = true
          }
        });
      }
      else {
        resp = false
      }
      return resp
    }
    catch (error){
      return false
    }
  }

  workflowAddHost = list => {
    try {
      let resp
      if (list) {
        list.exec.forEach((item, i) => {
          if (item.workflow_name === "checkpoint_add_host") {
            resp = true
          }
        });
      }
      else {
        resp = false
      }
      return resp
    }
    catch (error){
      return false
    }
  }

}

export default Authorizators
