import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from './error'
import RolesDescription from './rolesDescription'

import { Space, Row, Col, Table, Input, Button, Radio, Checkbox, Select, Spin, Progress } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';


import {
  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const assetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



//import List from './list'



class Permission extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};

    //this.jsonHelper = this.jsonHelper.bind(this);

    this.state = {
      searchText: '',
      searchedColumn: '',
      assets: [],
      originAssets: [],
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.assetsError) {
      this.setState({assetsRefresh: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({assetsRefresh: false})
      this.main()
    }
    if (this.state.assetsRefresh) {
      this.setState({assetsRefresh: false})
      this.main()
    }
  }

  componentWillUnmount() {
  }


  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        }
        else if ( Array.isArray(dataIndex) ) {
          let r = record[dataIndex[0]]
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase())
        }
        else {
          return ''
        }
      }
      catch (error){

      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text => {
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  main = async () => {
    await this.setState({loading: true})

    let fetchedAssets = await this.dataGet('assets')
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      await this.setState({loading: false})
      return
    }
    else {
      fetchedAssets.data.items.forEach((item, i) => {
        item.existent = true
        item.isModified = {}
        item.tlsverify = item.tlsverify.toString()
      });
      await this.setState({assets: fetchedAssets.data.items, originAssets: fetchedAssets.data.items})
    }

    await this.setState({loading: false})
  }

  dataGet = async (entities, assetId) => {
    let endpoint = `${this.props.vendor}/${entities}/`
    let r
    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, this.props.token)
    return r
  }

  assetsRefresh = async () => {
    await this.setState({assetsRefresh: true})
  }


  assetAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(this.state.assets))

    this.state.assets.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });

    n = id + 1
    p.id = n
    list.push(p)

    await this.setState({assets: list})
  }

  assetRemove = async p => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let newList = assets.filter(n => {
      return p.id !== n.id
    })

    //delete this[`inputTextAreaRef${p.id}`]
    await this.setState({assets: newList})
  }

  set = async (key, value, asset) => {
    console.log('key', key)
    console.log('value', value)
    console.log('asset', asset)

    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let origAsset = this.state.originAssets.find(a => a.id === asset.id)
    let ass = assets.find(a => a.id === asset.id)

    if (key === 'fqdn') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_fqdn`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.fqdn !== value) {
            ass.isModified.fqdn = true
            ass.fqdn = value
          }
          else {
            delete ass.isModified.fqdn
            ass.fqdn = value
          }
        }
        else {
          ass.fqdn = value
        }
        delete ass.fqdnError
      }
      else {
        //blank value while typing.
        ass.fqdn = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_fqdn`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'baseurl') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_baseurl`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.baseurl !== value) {
            ass.isModified.baseurl = true
            ass.baseurl = value
          }
          else {
            delete ass.isModified.baseurl
            ass.baseurl = value
          }
        }
        else {
          ass.baseurl = value
        }
        delete ass.baseurlError
      }
      else {
        //blank value while typing.
        ass.baseurl = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_baseurl`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'environment') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_environment`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.environment !== value) {
            ass.isModified.environment = true
            ass.environment = value
          }
          else {
            delete ass.isModified.environment
            ass.environment = value
          }
        }
        else {
          ass.environment = value
        }
        delete ass.environmentError
      }
      else {
        //blank value while typing.
        ass.environment = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_environment`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'datacenter') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_datacenter`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.datacenter !== value) {
            ass.isModified.datacenter = true
            ass.datacenter = value
          }
          else {
            delete ass.isModified.datacenter
            ass.datacenter = value
          }
        }
        else {
          ass.datacenter = value
        }
        delete ass.datacenterError
      }
      else {
        //blank value while typing.
        ass.datacenter = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_datacenter`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'tlsverify') {
      if (value) {
        if (ass.existent) {
          if (origAsset.tlsverify !== value) {
            ass.isModified.tlsverify = true
            ass.tlsverify = value
          }
          else {
            delete ass.isModified.tlsverify
            ass.tlsverify = value
          }
        }
        else {
          ass.tlsverify = value
        }
        delete ass.tlsverifyError
      }

      await this.setState({assets: assets})
    }

    if (key === 'username') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_username`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.username !== value) {
            ass.isModified.username = true
            ass.username = value
          }
          else {
            delete ass.isModified.username
            ass.username = value
          }
        }
        else {
          ass.username = value
        }
        delete ass.usernameError
      }
      else {
        //blank value while typing.
        ass.username = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_username`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'password') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_password`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        if (ass.existent) {
          if (origAsset.password !== value) {
            ass.isModified.password = true
            ass.password = value
          }
          else {
            delete ass.isModified.password
            ass.password = value
          }
        }
        else {
          ass.password = value
        }
        delete ass.passwordError
      }
      else {
        //blank value while typing.
        ass.password = ''
      }

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_password`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'toDelete') {
      if (value) {
        ass.toDelete = true
      }
      else {
        delete ass.toDelete
      }
      await this.setState({assets: assets})
    }

  }

  validation = async () => {
    let errors = await this.validationCheck()
    if (errors === 0) {
      this.cudManager()
    }
  }

  validationCheck = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let errors = 0
    let validators = new Validators()

    for (const ass of Object.values(assets)) {
      if (!validators.fqdn(ass.fqdn)) {
        ++errors
        ass.fqdnError = true
      }
      if (!ass.baseurl) {
        ass.baseurlError = true
        ++errors
      }
      if (!ass.environment) {
        ass.environmentError = true
        ++errors
      }
      if (!ass.datacenter) {
        ass.datacenterError = true
        ++errors
      }
      if (!ass.tlsverify) {
        ass.tlsverifyError = true
        ++errors
      }
      if (!ass.existent) {
        if (!ass.username) {
          ass.usernameError = true
          ++errors
        }
        if (!ass.password) {
          ass.passwordError = true
          ++errors
        }
      }
      else {
        if (ass.isModified.username && !ass.username) {
          ass.usernameError = true
          ++errors
        }
        if (ass.isModified.password && !ass.password) {
          ass.passwordError = true
          ++errors
        }
      }

    }
    await this.setState({assets: assets})
    return errors
  }

  cudManager = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const ass of Object.values(assets)) {
      if (ass.toDelete) {
        toDelete.push(ass)
      }
      if (ass.isModified && Object.keys(ass.isModified).length > 0) {
        toPatch.push(ass)
      }
      if (!ass.existent) {
        toPost.push(ass)
      }
    }
    console.log('toDelete', toDelete)
    console.log('toPatch', toPatch)
    console.log('toPost', toPost)


    if (toDelete.length > 0) {
      for (const ass of toDelete) {
        ass.loading = true
        await this.setState({assets: assets})

        let a = await this.assetDelete(ass.id)
        if (a.status && a.status !== 200 ) {
          this.props.dispatch(assetDeleteError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
        }

      }
    }

    //"api_type": "vmware",

    if (toPost.length > 0) {
      for (const ass of toPost) {
        let body = {}

        body.data = {
           "fqdn": ass.fqdn,
           "baseurl": ass.baseurl,
           "environment": ass.environment,
           "datacenter": ass.datacenter,
           "tlsverify": ass.tlsverify,
           "username": ass.username,
           "password": ass.password
        }
        if (this.props.vendor === 'vmware') {
          body.data.api_type = "vmware"
        }


        ass.loading = true
        await this.setState({assets: assets})

        let a = await this.assAdd(body)
        if (a.status && a.status !== 201 ) {
          this.props.dispatch(assetAddError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
        }

      }
    }

    if (toPatch.length > 0) {
      for (const ass of toPatch) {
        let body = {}

        body.data = {
           "fqdn": ass.fqdn,
           "baseurl": ass.baseurl,
           "environment": ass.environment,
           "datacenter": ass.datacenter,
           "tlsverify": ass.tlsverify
        }

        if (ass.isModified.username) {
          body.data.username = ass.username
        }
        if (ass.isModified.password) {
          body.data.password = ass.password
        }

        if (this.props.vendor === 'vmware') {
          body.data.api_type = "vmware"
        }

        ass.loading = true
        await this.setState({assets: assets})

        let a = await this.assModify(ass.id, body)
        if (a.status && a.status !== 200 ) {
          this.props.dispatch(assetModifyError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
        }

      }
    }

    this.assetsRefresh()

  }

  assetDelete = async (assetId) => {
    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/asset/${assetId}/`, this.props.token )
    return r
  }



  assModify = async (assId, body) => {
    let r
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/asset/${assId}/`, this.props.token, body )
    return r
  }

  assAdd = async (body) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token, body )
    return r
  }


  render() {
    console.log('assets', this.state.assets)

    let returnCol = () => {
      return vendorColumns
    }

    const vendorColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={assetLoadIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'Fqdn',
        align: 'center',
        dataIndex: 'fqdn',
        key: 'fqdn',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.fqdn}
              //ref={ref => this.setRef(ref, obj.id)}
              ref={ref => this.myRefs[`${obj.id}_fqdn`] = ref}
              style={
                obj.fqdnError ?
                  {borderColor: 'red', textAlign: 'left', width: 200}
                :
                  {textAlign: 'left', width: 200}
              }
              onChange={e => {
                this.set('fqdn', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {
        title: 'Baseurl',
        align: 'center',
        dataIndex: 'baseurl',
        key: 'baseurl',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.baseurl}
              //ref={ref => this.setRef(ref, obj.id)}
              ref={ref => this.myRefs[`${obj.id}_baseurl`] = ref}
              style={
                obj.baseurlError ?
                  {borderColor: 'red', textAlign: 'left', width: 250}
                :
                  {textAlign: 'left', width: 250}
              }
              onChange={e => {
                this.set('baseurl', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {
        title: 'Environment',
        align: 'center',
        dataIndex: 'environment',
        key: 'environment',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.environment}
              //ref={ref => this.setRef(ref, obj.id)}
              ref={ref => this.myRefs[`${obj.id}_environment`] = ref}
              style={
                obj.environmentError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('environment', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {
        title: 'Datacenter',
        align: 'center',
        dataIndex: 'datacenter',
        key: 'datacenter',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.datacenter}
              //ref={ref => this.setRef(ref, obj.id)}
              ref={ref => this.myRefs[`${obj.id}_datacenter`] = ref}
              style={
                obj.datacenterError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('datacenter', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {
        title: 'Tlsverify',
        align: 'center',
        dataIndex: 'tlsverify',
        key: 'tlsverify',
        render: (name, obj)  => {
          return (
              <Radio.Group
                style={
                  obj.tlsverifyError ?
                    {marginTop: 5, backgroundColor: 'red'}
                  :
                    {marginTop: 5}
                }
                value={obj && obj.tlsverify ? obj.tlsverify : null}
                onChange={e => {
                  this.set('tlsverify', e.target.value, obj)}
                }
              >
                <Space direction="vertical">
                  <Radio value='1'>Yes</Radio>
                  <Radio value='0'>No</Radio>
                </Space>
              </Radio.Group>
          )
        },
      },
      {
        title: 'Username',
        align: 'center',
        dataIndex: 'username',
        key: 'username',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.username}
              suffix={<UserOutlined className="site-form-item-icon" />}
              ref={ref => this.myRefs[`${obj.id}_username`] = ref}
              style={
                obj.usernameError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('username', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {
        title: 'Password',
        align: 'center',
        dataIndex: 'password',
        key: 'password',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input.Password
              value={obj.password}
              ref={ref => this.myRefs[`${obj.id}_password`] = ref}
              style={
                obj.passwordError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('password', e.target.value, obj)}
              }
            />
            </React.Fragment>
          )
        },
      },
      {/*
        title: 'Asset',
        align: 'center',
        dataIndex: 'assetFqdn',
        key: 'assetFqdn',
        ...this.getColumnSearchProps('assetFqdn'),
        render: (name, obj)  => (
          <Select
            value={obj.assetFqdn}
            showSearch
            style=
            { obj.assetIdError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('assetId', value, obj )}
          >
            { this.state.assets.map((ass, i) => {
                return (
                  <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
                )
              })
            }
          </Select>
        ),
      */},
      /*...(
        this.props.vendor === 'infoblox' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={obj && obj[this.state.subAsset] && !obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj[`${this.state.subAsset}Error`] ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.network ? sub.network : ''}>{sub.network ? sub.network : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
        :
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={obj && obj[this.state.subAsset] && !obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj[`${this.state.subAsset}Error`] ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.name ? sub.name : ''}>{sub.name ? sub.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
      ),*/
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.assetRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          //<Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>
          <React.Fragment>

            <Radio.Group>
              <Radio.Button
                style={{marginLeft: 16 }}
                onClick={() => this.assetsRefresh()}
              >
                <ReloadOutlined/>
              </Radio.Button>
            </Radio.Group>

            <Radio.Group
              buttonStyle="solid"
            >
              <Radio.Button
                buttonStyle="solid"
                style={{marginLeft: 16 }}
                onClick={() => this.assetAdd()}
              >
                Add asset
              </Radio.Button>
            </Radio.Group>

            <br/>
            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 15}}
              dataSource={this.state.assets}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />

              <Button
                type="primary"
                style={{float: 'right', marginRight: 15}}
                onClick={() => this.validation()}
              >
                Commit
              </Button>


          </React.Fragment>
          //</Space>
        }

        { this.props.assetsError ? <Error vendor={this.props.vendor} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.assetAddError ? <Error vendor={this.props.vendor} error={[this.props.assetAddError]} visible={true} type={'assetAddError'} /> : null }
        { this.props.assetModifyError ? <Error vendor={this.props.vendor} error={[this.props.assetModifyError]} visible={true} type={'assetModifyError'} /> : null }
        { this.props.assetDeleteError ? <Error vendor={this.props.vendor} error={[this.props.assetDeleteError]} visible={true} type={'assetDeleteError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  assetsError: state.concerto.assetsError,
  assetAddError: state.concerto.assetAddError,
  assetModifyError: state.concerto.assetModifyError,
  assetDeleteError: state.concerto.assetDeleteError,
}))(Permission);
