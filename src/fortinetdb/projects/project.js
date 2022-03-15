import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  projectError,

  devices,
  devicesError,

  ddosses,
  ddossesError,
} from '../store'

import Devices from '../devices/list'
import Ddosses from '../ddosses/list'

import { Input, Button, Space, Modal, Table, Tabs, Spin } from 'antd'

import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


class Project extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main()
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


  main = async () => {
    await this.resetDevices()
    await this.resetDdosses()
    this.fetchProject()
    this.fetchDevices()
    this.fetchDdosses()
  }

  resetDevices = async () => {
    let d = {
      data: {
        items: []
      }
    }
    this.props.dispatch(devices(d))
    return true
  }

  resetDdosses = async () => {
    let d = {
      data: {
        items: []
      }
    }
    this.props.dispatch(ddosses(d))
    return true
  }

  fetchProject = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let project = [resp.data]
        this.setState({loading: false, project: project, extraData: resp.data.extra_data})
      },
      error => {
        this.setState({loading: false, response: false})
        this.props.dispatch(projectError(error))
      }
    )
    await rest.doXHR(`fortinetdb/project/${this.props.obj.ID_PROGETTO}/`, this.props.token)
  }


  //http://10.0.111.23/api/v1/fortinetdb/devices/?fby=ID_PROGETTO&fval=1509
  fetchDevices = async () => {
    this.setState({devicesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(devicesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=ID_PROGETTO&fval=${this.props.obj.ID_PROGETTO}/`, this.props.token)
    this.setState({devicesLoading: false})
  }

  fetchDdosses = async () => {
    this.setState({ddossesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ddosses: resp.data.items})
      },
      error => {
        this.props.dispatch(ddossesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/ddosses/?fby=ID_PROGETTO&fval=${this.props.obj.ID_PROGETTO}/`, this.props.token)
    this.setState({ddossesLoading: false})
  }

  setExtraData = e => {
    this.setState({extraData: e})
  }

  modifyExtraData = async e => {
    let b = {}
    if (e.target && e.target.value) {
      b.data = {
        "extra_data": e.target.value
      }

      this.setState({extraLoading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({extraLoading: false})
          this.fetchProject()
        },
        error => {
          this.setState({extraLoading: false, response: false, error: error})
          this.props.dispatch(projectError(error))
        }
      )
      await rest.doXHR(`/fortinetdb/project/${this.props.obj.ID_PROGETTO}/`, this.props.token, b )
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = async () => {
    await this.resetDevices()
    await this.resetDdosses()
    this.setState({
      visible: false,
    })
  }


//NOME, ACCOUNT, RAGIONE SOCIALE, SEGMENTO, SERVIZIO

  render() {
    const columns = [
      {
        title: "NOME",
        align: "center",
        width: 200,
        dataIndex: "NOME",
        key: "NOME",
        ...this.getColumnSearchProps("NOME")
      },
      {
        title: "ACCOUNT",
        align: "center",
        width: 200,
        dataIndex: "ACCOUNT",
        key: "ACCOUNT",
        ...this.getColumnSearchProps("ACCOUNT")
      },
      {
        title: "RAGIONE_SOCIALE",
        align: "center",
        width: 200,
        dataIndex: "RAGIONE_SOCIALE",
        key: "RAGIONE_SOCIALE",
        ...this.getColumnSearchProps("RAGIONE_SOCIALE")
      },
      {
        title: "SEGMENTO",
        align: "center",
        width: 200,
        dataIndex: "SEGMENTO",
        key: "SEGMENTO",
        ...this.getColumnSearchProps("SEGMENTO")
      },
      {
        title: "SERVIZIO",
        align: "center",
        width: 200,
        dataIndex: "SERVIZIO",
        key: "SERVIZIO",
        ...this.getColumnSearchProps("SERVIZIO")
      }
    ]

    return (
      <React.Fragment>
        <Button type='primary' onClick={() => this.details()} shape='round'>
          {this.props.obj.ID_PROGETTO}
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Project</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          <Table
            columns={columns}
            dataSource={this.state.project}
            bordered
            rowKey="ID_PROGETTO"
            layout="vertical"
            pagination={false}
            style={{ width: 'auto', marginBottom: 10}}
            scroll={{x: 'auto'}}
          >
          </Table>

          <React.Fragment>
            <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
              <Tabs type="card">
                {this.state.devicesLoading ?
                  <TabPane key="devices" tab="Devices">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                :
                  <TabPane key="devices" tab=<span>Devices<ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.fetchDevices()}/></span>>
                    <Devices height={350} pagination={5} filteredDevices={this.state.devices}/>
                  </TabPane>
                }
                {this.state.ddossesLoading ?
                  <TabPane key="ddosses" tab="Ddosses">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                :
                  <TabPane key="ddosses" tab=<span>Ddosses<ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.fetchDdosses()}/></span>>
                    <Ddosses height={350} pagination={5} filteredDdosses={this.state.ddosses}/>
                  </TabPane>
                }
              </Tabs>

            </Space>
          </React.Fragment>
        </Modal>


        {this.state.visible ?
          <React.Fragment>

            { this.props.projectError ? <Error component={'fortinetdb project'} error={[this.props.projectError]} visible={true} type={'projectError'} /> : null }
            { this.props.devicesError ? <Error component={'fortinetdb project'} error={[this.props.devicesError]} visible={true} type={'devicesError'} /> : null }
            { this.props.ddossesError ? <Error component={'fortinetdb project'} error={[this.props.ddossesError]} visible={true} type={'ddossesError'} /> : null }

          </React.Fragment>
        :
          null
        }


      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,

  devices: state.fortinetdb.devices,
  ddosses: state.fortinetdb.ddosses,

  projectError: state.fortinetdb.projectError,
  devicesError: state.fortinetdb.devicesError,
  ddossesError: state.fortinetdb.ddossesError,
}))(Project);
