import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import { Space, Table, Input, Button, Spin, Select, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Add from './add'
import Modify from './modify'
import Delete from './delete'

import {
  triggersFetch,
  err,
} from '../store'


const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const loadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      assets: [],
      triggers: [],
      expandedKeys: [],
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (!this.props.error) {
      this.props.dispatch(triggersFetch(false))
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.vendor !== this.props.vendor) {
      this.props.dispatch(triggersFetch(false))
      this.main()
    }
    if (this.props.triggersFetch) {
      this.props.dispatch(triggersFetch(false))
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

  onTableRowExpand = (expanded, record) => {
    let keys = Object.assign([], this.state.expandedKeys);

    if(expanded){
      keys.push(record.id); // I have set my record.id as row key. Check the documentation for more details.
    }
    else {
      keys = keys.filter(k => k !== record.id)
    }
    this.setState({expandedKeys: keys});
  }


  main = async () => {
    await this.setState({loading: true})

    let fetchedAssets = await this.assetGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      let error = Object.assign(fetchedAssets, {
        component: 'trigger',
        vendor: 'concerto',
        errorType: 'assetsError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({assets: fetchedAssets.data.items})
    }

    let fetchedTriggers = await this.triggerGet()
    if (fetchedTriggers.status && fetchedTriggers.status !== 200 ) {
      let error = Object.assign(fetchedTriggers, {
        component: 'trigger',
        vendor: 'concerto',
        errorType: 'triggersError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      return
    }
    else {
      let trigs = []
      let asset
      let ass
      fetchedTriggers.data.items.forEach((trig, i) => {
        asset = this.state.assets.find(a => a.id === trig.dst_asset_id)
        trig.dst_asset_fqdn = asset.fqdn

        if (trig.conditions.length > 0) {
          trig.conditions.forEach((cond, i) => {
            ass = this.state.assets.find(a => a.id === cond.src_asset_id)
            cond.src_asset_fqdn = ass.fqdn
            cond.existent = true
            let split = cond.condition.split('src-ip-in:')
            cond.conditionNoPrfx = split[1]
          });
        }

        trigs.push(trig)
      });

      await this.setState({triggers: trigs, loading: false})
    }
  }

  triggersRefresh = async () => {
    this.props.dispatch(triggersFetch(true))
  }

  assetGet = async () => {
    let endpoint = `${this.props.vendor}/assets/`

    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    await rest.doXHR(`${endpoint}`, this.props.token)

    return r
  }

  triggerGet = async () => {
    let endpoint = `${this.props.vendor}/triggers/`

    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    await rest.doXHR(`${endpoint}`, this.props.token)

    return r
  }

  conditionAdd = async trigger => {
    let triggers = JSON.parse(JSON.stringify(this.state.triggers))
    let trig = triggers.find(t => t.id === trigger.id)

    let id = 0
    let n = 0
    trig.conditions.forEach(c => {
      if (c.condition_id > id) {
        id = c.condition_id
      }
    });
    n = id + 1

    let newCondition = {condition_id: n}
    trig.conditions.push(newCondition)

    await this.setState({triggers: triggers})
  }

  conditionRemove = async (trigger, condition_id) => {

    let triggers = JSON.parse(JSON.stringify(this.state.triggers))
    let trig = triggers.find(t => t.id === trigger.id)

    let newConditions = trig.conditions.filter(c => {
      return condition_id.condition_id !== c.condition_id
    })
    trig.conditions = newConditions

    await this.setState({triggers: triggers})
  }

  set = async (key, value, trigger, condition) => {
    let triggers = JSON.parse(JSON.stringify(this.state.triggers))
    let trig = triggers.find(t => t.id === trigger.id)
    let cond = trig.conditions.find(c => c.condition_id === condition.condition_id)
    let ass = this.state.assets.find(a => a.id === value)

    if (key === 'src_asset_id') {
      cond.src_asset_id = value
      cond.src_asset_fqdn = ass.fqdn
      delete cond.src_asset_idError
      delete cond.src_asset_fqdnError
    }
    if (key === 'condition') {
      cond.condition = `src-ip-in:${value}`
      cond.conditionNoPrfx = value
      delete cond.conditionError
      delete cond.conditionNoPrfxError
    }
    if (key === 'toDelete') {
      if (value) {
        cond.toDelete = true
      }
      else {
        delete cond.toDelete
      }
    }

    await this.setState({triggers: triggers})
  }

  validationCheck = async (trigger) => {
    let triggers = JSON.parse(JSON.stringify(this.state.triggers))
    let trig = triggers.find(t => t.id === trigger.id)
    let validators = new Validators()
    let ok = true

    trig.conditions.forEach((cond, i) => {
      if (!cond.src_asset_id) {
        cond.src_asset_idError = 'error'
        ok = false
      }
      if (!cond.conditionNoPrfx ) {
        cond.conditionNoPrfxError = 'error'
        ok = false
      }
      if (!validators.isSubnet(cond.conditionNoPrfx)) {
        cond.conditionNoPrfxError = 'error'
        ok = false
      }
    });


    await this.setState({triggers: triggers})
    return ok
  }

  conditionCommit = async trigger => {
    let valid = await this.validationCheck(trigger)
    let triggers = JSON.parse(JSON.stringify(this.state.triggers))
    let trig = triggers.find(t => t.id === trigger.id)
    let smtToCommit = false
    if (valid) {
      for await (const cond of trig.conditions) {
        if (cond.toDelete) {
          smtToCommit = true
          cond.loading = true
          this.setState({triggers: triggers})

          let condDel = await this.condDel(cond.condition_id, trig.id)
          if (condDel.status && condDel.status !== 200 ) {
            let error = Object.assign(condDel, {
              component: 'trigger',
              vendor: 'concerto',
              errorType: 'conditionDeleteError'
            })
            this.props.dispatch(err(error))
            cond.loading = false
            this.setState({triggers: triggers})
          }

          cond.loading = false
          this.setState({triggers: triggers})
        }
        else if (!cond.existent) {
          smtToCommit = true
          cond.loading = true
          this.setState({triggers: triggers})

          let condAdd = await this.condAdd(cond, trig.id)
          if (condAdd.status && condAdd.status !== 201 ) {
            let error = Object.assign(condAdd, {
              component: 'trigger',
              vendor: 'concerto',
              errorType: 'conditionAddError'
            })
            this.props.dispatch(err(error))
            cond.loading = false
            this.setState({triggers: triggers})
          }

          cond.loading = false
          this.setState({triggers: triggers})
        }
      }
    }
    if (smtToCommit) {
      this.props.dispatch(triggersFetch(true))
    }
  }

  condAdd = async (cond, trig_id) => {
    let r
    let b = {}

    b.data = {
      "src_asset_id": cond.src_asset_id,
      "condition": cond.condition
    }

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/trigger/${trig_id}/conditions/`, this.props.token, b )
    return r
  }

  condDel = async (cond_id, trig_id) => {
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
    await rest.doXHR(`infoblox/trigger/${trig_id}/condition/${cond_id}/`, this.props.token )
    return r
  }



  render() {

    let returnCol = () => {
      return infobloxColumns
    }

    const expandedRowRender = (...params) => {
      const columns = [
        {
          title: 'Loading',
          align: 'center',
          dataIndex: 'loading',
          key: 'loading',
          render: (name, obj)  => (
            <Space size="small">
              {obj.loading ? <Spin indicator={loadIcon} style={{margin: '10% 10%'}}/> : null }
            </Space>
          ),
        },
        {
          title: 'Condition id',
          align: 'center',
          dataIndex: 'condition_id',
          key: 'condition_id',
          ...this.getColumnSearchProps('condition_id'),
        },
        {
          title: 'Condition',
          align: 'center',
          dataIndex: 'conditionNoPrfx',
          key: 'conditionNoPrfx',
          ...this.getColumnSearchProps('conditionNoPrfx'),
          render: (name, obj)  => {
            const inputRef = React.createRef();
            return (
              <Input
                addonBefore="src-ip-in:"
                value={obj.conditionNoPrfx}
                ref={inputRef}
                //onClick={e => (this.textInput.current.value = e)}
                style=
                { obj.conditionNoPrfxError ?
                  {width: 250, border: `1px solid red`}
                :
                  {width: 250}
                }
                disabled={obj.existent ? true : false}
                onChange={e => this.set('condition', e.target.value, params[0], obj )}
              />
            )},
        },
        {
          title: 'Source asset',
          align: 'center',
          dataIndex: 'src_asset_fqdn',
          key: 'src_asset_fqdn',
          ...this.getColumnSearchProps('src_asset_fqdn'),
          render: (name, obj)  => (
            <Space size="small">
            { obj.existent ?
              name
            :
              <Select
                value={obj.src_asset_fqdn}
                showSearch
                style=
                { obj.src_asset_idError ?
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
                onSelect={value => this.set('src_asset_id', value, params[0], obj )}
              >
                { this.state.assets.map((ass, i) => {
                    return (
                      <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
                    )
                  })
                }
              </Select>
            }

            </Space>
          ),
        },
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
                  onChange={e => this.set('toDelete', e.target.checked, params[0], obj)}
                />
              :
                <Button
                  type='danger'
                  shape='round'
                  onClick={(e) => this.conditionRemove(params[0], obj)}
                >
                  -
                </Button>
              }
            </Space>
          ),
        }
      ];

      return (
        <React.Fragment>
          <br/>
          <Button
            type="primary"
            shape='round'
            onClick={() => this.conditionAdd(params[0])}
          >
            Add condition
          </Button>
          <br/>
          <br/>
          <Table
            columns={columns}
            rowKey={record => record.condition_id}
            dataSource={params[0].conditions}
            pagination={{pageSize: 10}}
          />
          <Button
            type="primary"
            shape='round'
            style={{float: 'right'}}
            onClick={() => this.conditionCommit(params[0])}
          >
            Commit
          </Button>
        </React.Fragment>
      )
    };


    const infobloxColumns = [
      {
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Destination asset',
        align: 'center',
        dataIndex: 'dst_asset_fqdn',
        key: 'dst_asset_fqdn',
        ...this.getColumnSearchProps('dst_asset_fqdn'),
      },
      {
        title: 'Action',
        align: 'center',
        dataIndex: 'action',
        key: 'action',
        ...this.getColumnSearchProps('action'),
      },
      {
        title: 'Enabled',
        align: 'center',
        dataIndex: 'enabled',
        key: 'enabled',
        ...this.getColumnSearchProps('enabled'),
      },
      {
        title: 'Modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        render: (name, obj)  => (
          <Modify name={name} obj={obj} vendor='infoblox'/>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Delete name={name} obj={obj} vendor='infoblox'/>
        ),
      }
    ];

    let errors = () => {
      if (this.props.error && this.props.error.component === 'trigger') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>

            <Space wrap>
              <Button
                shape='round'
                onClick={() => this.triggersRefresh()}
              >
                <ReloadOutlined/>
              </Button>

              <Add vendor={this.props.vendor} assets={this.state.assets}/>
            </Space>

            <br/>
            <Table
              columns={returnCol()}
              dataSource={this.state.triggers}
              bordered
              scroll={{x: 'auto'}}
              pagination={{pageSize: 10}}
              style={{marginBottom: 10}}
              onExpand={this.onTableRowExpand}
              expandedRowKeys={this.state.expandedKeys}
              rowKey={record => record.id}
              expandedRowRender={ record => expandedRowRender(record)}
            />
          </Space>
        }
        
        {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  triggersFetch: state.concerto.triggersFetch,
}))(Manager);
