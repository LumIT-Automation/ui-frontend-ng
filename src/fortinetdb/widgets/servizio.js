import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  servizios,
  serviziosLoading,
  serviziosError,
  servizio,
  servizioLoading,
  servizioError,
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
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              this.setState({
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
              });
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
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
        this.props.dispatch(serviziosError(error))
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
        this.props.dispatch(servizioError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fby=SERVIZIO&fval=${this.props.servizio}`, this.props.token)
    this.props.dispatch(servizioLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

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
              { this.props.serviziosError ? <Error component={'SERVIZIO'} error={[this.props.serviziosError]} visible={true} type={'serviziosError'} /> : null }
              { this.props.servizioError ? <Error component={'SERVIZIO'} error={[this.props.servizioError]} visible={true} type={'servizioError'} /> : null }
            </React.Fragment>
          :
            null
          }

          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  servizios: state.fortinetdb.servizios,
  serviziosLoading: state.fortinetdb.serviziosLoading,
  serviziosError: state.fortinetdb.serviziosError,

  servizio: state.fortinetdb.servizio,
  servizioLoading: state.fortinetdb.servizioLoading,
  servizioError: state.fortinetdb.servizioError,

}))(Servizio);
