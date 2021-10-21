import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />

/*

*/


class Details extends React.Component {

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
    this.fetchDevice()
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

  fetchDevice = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.setState({loading: false})
        let device = [resp.data]
        this.setState({device: device})
      },
      error => {
        this.setState({loading: false, success: false})
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`fortinetdb/device/${this.props.obj.SERIALE}/`, this.props.token)
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.props.dispatch(setProfilesFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {
    console.log(this.props.data)
    //console.log(this.props.obj)

    const columns = [
  {
    title: "SERIALE",
    align: "center",
    width: "auto",
    dataIndex: "SERIALE",
    key: "SERIALE",
    ...this.getColumnSearchProps('SERIALE')
  },
  {
    title: "ID_PROGETTO",
    align: "center",
    width: "auto",
    dataIndex: "ID_PROGETTO",
    key: "ID_PROGETTO",
    ...this.getColumnSearchProps('ID_PROGETTO')
  },
  {
    title: "MODELLO",
    align: "center",
    width: "auto",
    dataIndex: "MODELLO",
    key: "MODELLO",
    ...this.getColumnSearchProps('MODELLO')
  },
  {
    title: "FIRMWARE",
    align: "center",
    width: "auto",
    dataIndex: "FIRMWARE",
    key: "FIRMWARE",
    ...this.getColumnSearchProps('FIRMWARE')
  },
  {
    title: "DESCRIZIONE",
    align: "center",
    width: "auto",
    dataIndex: "DESCRIZIONE",
    key: "DESCRIZIONE",
    ...this.getColumnSearchProps('DESCRIZIONE')
  },
  {
    title: "HA",
    align: "center",
    width: "auto",
    dataIndex: "HA",
    key: "HA",
    ...this.getColumnSearchProps('HA')
  },
  {
    title: "VDOM",
    align: "center",
    width: "auto",
    dataIndex: "VDOM",
    key: "VDOM",
    ...this.getColumnSearchProps('VDOM')
  },
  {
    title: "IP_MGMT",
    align: "center",
    width: "auto",
    dataIndex: "IP_MGMT",
    key: "IP_MGMT",
    ...this.getColumnSearchProps('IP_MGMT')
  },
  {
    title: "PORT_MGMT",
    align: "center",
    width: "auto",
    dataIndex: "PORT_MGMT",
    key: "PORT_MGMT",
    ...this.getColumnSearchProps('PORT_MGMT')
  },
  {
    title: "REVERSE",
    align: "center",
    width: "auto",
    dataIndex: "REVERSE",
    key: "REVERSE",
    ...this.getColumnSearchProps('REVERSE')
  },
  {
    title: "INDIRIZZO",
    align: "center",
    width: "auto",
    dataIndex: "INDIRIZZO",
    key: "INDIRIZZO",
    ...this.getColumnSearchProps('INDIRIZZO')
  },
  {
    title: "POSIZIONE",
    align: "center",
    width: "auto",
    dataIndex: "POSIZIONE",
    key: "POSIZIONE",
    ...this.getColumnSearchProps('POSIZIONE')
  },
  {
    title: "KEYMAKER",
    align: "center",
    width: "auto",
    dataIndex: "KEYMAKER",
    key: "KEYMAKER",
    ...this.getColumnSearchProps('KEYMAKER')
  },
  {
    title: "USERADMIN",
    align: "center",
    width: "auto",
    dataIndex: "USERADMIN",
    key: "USERADMIN",
    ...this.getColumnSearchProps('USERADMIN')
  },
  {
    title: "PUBLIC_NET",
    align: "center",
    width: "auto",
    dataIndex: "PUBLIC_NET",
    key: "PUBLIC_NET",
    ...this.getColumnSearchProps('PUBLIC_NET')
  },
  {
    title: "CODICE_SERVIZIO",
    align: "center",
    width: "auto",
    dataIndex: "CODICE_SERVIZIO",
    key: "CODICE_SERVIZIO",
    ...this.getColumnSearchProps('CODICE_SERVIZIO')
  },
  {
    title: "NOTE_APPARATO",
    align: "center",
    width: "auto",
    dataIndex: "NOTE_APPARATO",
    key: "NOTE_APPARATO",
    ...this.getColumnSearchProps('NOTE_APPARATO')
  },
  {
    title: "ASSISTENZA",
    align: "center",
    width: "auto",
    dataIndex: "ASSISTENZA",
    key: "ASSISTENZA",
    ...this.getColumnSearchProps('ASSISTENZA')
  },
  {
    title: "PROFILO",
    align: "center",
    width: "auto",
    dataIndex: "PROFILO",
    key: "PROFILO",
    ...this.getColumnSearchProps('PROFILO')
  },
  {
    title: "ATTIVAZIONE_ANNO",
    align: "center",
    width: "auto",
    dataIndex: "ATTIVAZIONE_ANNO",
    key: "ATTIVAZIONE_ANNO",
    ...this.getColumnSearchProps('ATTIVAZIONE_ANNO')
  },
  {
    title: "ATTIVAZIONE_MESE",
    align: "center",
    width: "auto",
    dataIndex: "ATTIVAZIONE_MESE",
    key: "ATTIVAZIONE_MESE",
    ...this.getColumnSearchProps('ATTIVAZIONE_MESE')
  },
  {
    title: "DISK_STATUS",
    align: "center",
    width: "auto",
    dataIndex: "DISK_STATUS",
    key: "DISK_STATUS",
    ...this.getColumnSearchProps('DISK_STATUS')
  },
  {
    title: "AUTENTICAZIONE",
    align: "center",
    width: "auto",
    dataIndex: "AUTENTICAZIONE",
    key: "AUTENTICAZIONE",
    ...this.getColumnSearchProps('AUTENTICAZIONE')
  },
  {
    title: "SERVIZI",
    align: "center",
    width: "auto",
    dataIndex: "SERVIZI",
    key: "SERVIZI",
    ...this.getColumnSearchProps('SERVIZI')
  },
  {
    title: "ADDURL_MGMT",
    align: "center",
    width: "auto",
    dataIndex: "ADDURL_MGMT",
    key: "ADDURL_MGMT",
    ...this.getColumnSearchProps('ADDURL_MGMT')
  },
  {
    title: "SNMP_COMMUNITY",
    align: "center",
    width: "auto",
    dataIndex: "SNMP_COMMUNITY",
    key: "SNMP_COMMUNITY",
    ...this.getColumnSearchProps('SNMP_COMMUNITY')
  },
  {
    title: "SNMP_PORT",
    align: "center",
    width: "auto",
    dataIndex: "SNMP_PORT",
    key: "SNMP_PORT",
    ...this.getColumnSearchProps('SNMP_PORT')
  },
  {
    title: "STATUS_APPARATO",
    align: "center",
    width: "auto",
    dataIndex: "STATUS_APPARATO",
    key: "STATUS_APPARATO",
    ...this.getColumnSearchProps('STATUS_APPARATO')
  },
  {
    title: "BACKUP_SCRIPT",
    align: "center",
    width: "auto",
    dataIndex: "BACKUP_SCRIPT",
    key: "BACKUP_SCRIPT",
    ...this.getColumnSearchProps('BACKUP_SCRIPT')
  },
  {
    title: "BACKUP_STATUS",
    align: "center",
    width: "auto",
    dataIndex: "BACKUP_STATUS",
    key: "BACKUP_STATUS",
    ...this.getColumnSearchProps('BACKUP_STATUS')
  },
  {
    title: "BACKUP_TSTAMP",
    align: "center",
    width: "auto",
    dataIndex: "BACKUP_TSTAMP",
    key: "BACKUP_TSTAMP",
    ...this.getColumnSearchProps('BACKUP_TSTAMP')
  },
  {
    title: "BACKUP_CHECKSUM",
    align: "center",
    width: "auto",
    dataIndex: "BACKUP_CHECKSUM",
    key: "BACKUP_CHECKSUM",
    ...this.getColumnSearchProps('BACKUP_CHECKSUM')
  },
  {
    title: "comune",
    align: "center",
    width: "auto",
    dataIndex: "comune",
    key: "comune",
    ...this.getColumnSearchProps('comune')
  },
  {
    title: "provincia",
    align: "center",
    width: "auto",
    dataIndex: "provincia",
    key: "provincia",
    ...this.getColumnSearchProps('provincia')
  },
  {
    title: "targa",
    align: "center",
    width: "auto",
    dataIndex: "targa",
    key: "targa",
    ...this.getColumnSearchProps('targa')
  },
  {
    title: "regione",
    align: "center",
    width: "auto",
    dataIndex: "regione",
    key: "regione",
    ...this.getColumnSearchProps('regione')
  },
  {
    title: "extra_data",
    align: "center",
    width: "auto",
    dataIndex: "extra_data",
    key: "extra_data",
    ...this.getColumnSearchProps('extra_data')
  }
]

    return (
      <React.Fragment>
        <Button type='primary' onClick={() => this.details()} shape='round'>
          {this.props.obj.SERIALE}
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Details</p>}
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
            dataSource={this.state.device}
            bordered
            rowKey="name"
            layout="vertical"
            //pagination={false}
            pagination={{ pageSize: 10 }}
            style={{ width: 'auto', marginBottom: 10}}
            scroll={{x: 'auto'}}
          >
          </Table>
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
}))(Details);
