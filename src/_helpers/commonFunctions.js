class CommonFunctions {

  elementAdd = (elements, type) => {
    let id = 0
    let n = 0
    let e = {}
    let list = JSON.parse(JSON.stringify(elements))

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

  elementRemove = async (el, elements) => {
    console.log('el', el)
    console.log('elements', elements)
    let list = JSON.parse(JSON.stringify(elements))
    let newList = list.filter(n => {
      return el.id !== n.id
    })
    return newList
  }


}

export default CommonFunctions