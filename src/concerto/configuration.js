import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'

import { Space, Table, Input, Button, Spin, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';


import {
  err,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

//import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};
    this.textAreaRefs = {};

    this.state = {
      configurations: [],
      errors: {},
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (!this.props.error && !this.props.configurations) {
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.main()
    }
  }

  componentWillUnmount() {
    this.setState({configurations: []})
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
    let confs = []
    let configurationsFetched = await this.dataGet('/configuration/global/')
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      let error = Object.assign(configurationsFetched, {
        component: 'configuration',
        vendor: 'concerto',
        errorType: 'configurationsError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      return
    }
    else {
      confs = configurationsFetched.data.configuration

      if (configurationsFetched.data.configuration.length > 0) {
        confs.forEach((item, i) => {
          item.existent = true
        });
        //conf = JSON.parse(configurationsFetched.data.configuration)
      }



      await this.setState({loading: false, configurations: confs})
    }
  }

  dataGet = async (entities) => {
    let endpoint = `${this.props.vendor}${entities}`
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

  addRecord = async () => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let idList = []
    let n

    if (conf.length < 1) {
      n = 1
    }
    conf.forEach(r => {
      idList.push(Number(r.id))
    });

    let m = Math.max(...idList)
    if ( !n ) {
      n = m + 1
    }

    let r = {id: n}
    conf.push(r)
    await this.setState({configurations: conf})
  }

  removeRecord = async obj => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let newList = conf.filter(n => {
      return obj.id !== n.id
    })
    delete errors[obj.id]
    await this.setState({configurations: newList, errors: errors})
  }

  set = async (key, value, configuration) => {

    let configurations = JSON.parse(JSON.stringify(this.state.configurations))
    let conf

    if (configuration) {
      conf = configurations.find(cn => cn.id === configuration.id)

      if (key === 'key') {
        let start = 0
        let end = 0
        let ref = this.myRefs[`${configuration.id}_key`]

        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          conf['key'] = value
          delete conf['keyError']
        }
        else {
          //blank value while typing.
          conf['key'] = ''
        }

        await this.setState({configurations: configurations})
        ref = this.myRefs[`${configuration.id}_key`]

        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'value') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${configuration.id}_value`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          start = ref.resizableTextArea.textArea.selectionStart
          end = ref.resizableTextArea.textArea.selectionEnd
        }

        if (value) {
          conf['value'] = value
          delete conf['valueError']
        }
        else {
          //blank value while typing.
          conf['value'] = ''
        }

        await this.setState({configurations: configurations})
        ref = this.textAreaRefs[`${configuration.id}_value`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'toDelete') {
        if (value) {
          conf.toDelete = true
        }
        else {
          delete conf.toDelete
        }
      }

    }

    if (key !== 'key' && key !== 'value') {
      await this.setState({configurations: configurations})
    }

  }

  validationCheck = async () => {
    let configurations = JSON.parse(JSON.stringify(this.state.configurations))
    let errors = 0

      for (let conf of Object.values(configurations)) {
        if (!conf.key) {
          ++errors
          conf.keyError = true
        }
        if (!conf.value) {
          ++errors
          conf.valueError = true
        }
      }

    await this.setState({configurations: configurations})
    return errors
  }

  validation = async () => {
    let errors = await this.validationCheck()
    if (errors === 0) {
      let configurations = JSON.parse(JSON.stringify(this.state.configurations))
      let newList = configurations.filter(conf => {
        return !conf.toDelete
      })

      this.modifyConfiguration(newList)
    }
  }


  modifyConfiguration = async (configurations) => {
    await this.setState({loading: true})

    let b = {}
    b.data = {
      "configuration": configurations
    }

    let rest = new Rest(
      "PUT",
      resp => {
        this.setState({loading: false})
        this.main()
      },
      error => {
        this.setState({loading: false})
        error = Object.assign(error, {
          component: 'configuration',
          vendor: 'concerto',
          errorType: 'modifyConfigurationError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`${this.props.vendor}/configuration/global/`, this.props.token, b )
  }




  render() {

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              value={obj[key]}
              style=
                {obj[`${key}Error`] ?
                  {borderColor: 'red', width: 200}
                :
                  {width: 200}
                }
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
            />
          )

        case 'textArea':
          return (
            <Input.TextArea
              rows={12}
              value={obj[key]}
              ref={ref => this.textAreaRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
              style=
                { obj[`${key}Error`] ?
                  {borderColor: `red`, width: 350}
                :
                  {width: 350}
                }
            />
          )

        case 'button':
          return (
            <Button
              type="danger"
              onClick={() => this.removeRecord(obj)}
            >
              -
            </Button>
          )

        case 'checkbox':
          return (
            <Checkbox
              checked={obj[key]}
              onChange={e => this.set('toDelete', e.target.checked, obj)}
            />
          )

        default:
      }
    }

    const columns = [
      {
        title: 'Key',
        align: 'center',
        dataIndex: 'key',
        key: 'key',
        render: (name, record)  => (
          createElement('input', 'key', '', record, '')
        )
      },
      {
        title: 'Value',
        align: 'center',
        width: 500,
        dataIndex: 'value',
        key: 'value',
        render: (name, record)  => (
          createElement('textArea', 'value', '', record, '')
        )
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        width: 150,
        key: 'delete',
        render: (name, record)  => (
          record.existent ?
            createElement('checkbox', 'toDelete', '', record, '')
          :
            createElement('button', '', '', record, '')
        )
      },
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    let errors = () => {
      if (this.props.error && this.props.error.component === 'configuration') {
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
                onClick={() => this.main()}
              >
                <ReloadOutlined/>
              </Button>
              <Button
                type="primary"
                onClick={() => this.addRecord()}
              >
                +
              </Button>
            </Space>

            <Table
              columns={columns}
              dataSource={this.state.configurations}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />

            <Button
              type="primary"
              style={{float: "right", marginTop: '15px'}}
              onClick={() => this.validation()}
            >
              Commit
            </Button>
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
}))(Manager);
