class CommonFunctions {

  itemAdd = (items, type) => {
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
    //list.push(p)
    list = [e].concat(list)
    return list
  }

  itemRemove = async (el, items) => {
    let list = JSON.parse(JSON.stringify(items))
    list = list.filter(n => el.id !== n.id)
    return list
  }


}

export default CommonFunctions