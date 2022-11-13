

class Authorizators {

  isSuperAdmin = a => {
    if (a) {
      try {
        for (const [key, value] of Object.entries(a) ) {
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
