import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  servizios,
  serviziosLoading,
  servizio,
  servizioLoading,
} from '../store'

import List from '../projects/list'

import { Modal, Spin, Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Servizio extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.servizios) {
      this.serviziosGet()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

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

  handleServizioGet = async name => {
    await this.props.dispatch(servizio(name.target.innerText))
    await this.setState({visible: true})
    await this.servizioGet()
  }

  serviziosGet = async () => {
    this.props.dispatch(serviziosLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(servizios(resp.data.items))
      },
      error => {
        error = Object.assign(error, {
          component: 'servizio',
          vendor: 'fortinetdb',
          errorType: 'serviziosError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fieldValues=SERVIZIO`, this.props.token)
    this.props.dispatch(serviziosLoading(false))
  }

  servizioGet = async () => {
    this.props.dispatch(servizioLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({projects: resp.data.items})
      },
      error => {
        error = Object.assign(error, {
          component: 'servizio',
          vendor: 'fortinetdb',
          errorType: 'servizioError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fby=SERVIZIO&fval=${this.props.servizio}`, this.props.token)
    this.props.dispatch(servizioLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'servizio') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const columns = [
      {
        title: "SERVIZIO",
        align: "center",
        width: 200,
        dataIndex: "SERVIZIO",
        key: "SERVIZIO",
        render: (name, obj) => <p
          style={{color: 'blue'}}
          onClick={name => this.handleServizioGet(name)}
          >
            {name}
          </p>,
      },
      {
        title: "COUNT",
        align: "center",
        width: 200,
        dataIndex: "COUNT",
        key: "COUNT",
        ...this.getColumnSearchProps("COUNT")
      }
    ]

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>
        { this.props.serviziosLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Table
              columns={columns}
              dataSource={this.props.servizios}
              scroll={{ x: 'auto', y: 'auto'}}
              bordered
              rowKey={randomKey}
              pagination={{ pageSize: 10 }}
              style={{marginBottom: 10}}
            />

          { this.state.visible ?
            <React.Fragment>
              <Modal
                title={<p style={{textAlign: 'center'}}>{this.props.servizio}</p>}
                centered
                destroyOnClose={true}
                visible={this.state.visible}
                footer={''}
                //onOk={() => this.setState({visible: true})}
                onCancel={this.hide}
                width={1500}
                maskClosable={false}
              >
                { this.props.servizioLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                  <React.Fragment>
                    { this.props.servizio ?
                      <List height={550} pagination={5} filteredProjects={this.state.projects}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>
              
            </React.Fragment>
          :
            null
          }
          {errors()}
          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.fortinetdb,
  error: state.concerto.err,

  servizios: state.fortinetdb.servizios,
  serviziosLoading: state.fortinetdb.serviziosLoading,

  servizio: state.fortinetdb.servizio,
  servizioLoading: state.fortinetdb.servizioLoading,
}))(Servizio);
