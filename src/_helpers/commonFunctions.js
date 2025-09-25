class CommonFunctions {

  itemAdd = (items, type) => {
    try {
      let id = 0
      let n = 0
      let e = {}
      let list = JSON.parse(JSON.stringify(items))

      list.forEach(e => {
        if (e.id > id) {
          id = e.id
        }
      });

      n = id + 1
      e.id = n
      if (type === 'snatpools') {
        e.members = [{id:1}]
      }
      if (type === 'pools') {
        e.members = [{id:1}]
      }
      else if (type === 'workflowRemoveHost') {
        e.assets = []
      }
      //list.push(p)
      list = [e].concat(list)
      return list
    }
    catch(e) {
      console.error(e)
    }
    
  }

  itemRemove = async (el, items) => {
    try {
      let list = JSON.parse(JSON.stringify(items))
      list = list.filter(n => el.id !== n.id)
      return list || []
    }
    catch(e) {
      console.error(e)
    }
    
  }

}

export default CommonFunctions