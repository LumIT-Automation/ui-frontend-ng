import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'

import Device from './device'

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';




class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
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

  resetError = () => {
    this.setState({ error: null})
  }


  render() {

/*
"MANAGED_OBJECT": "TMS-CUST-FACEBOOK-EU",
"ID_PROGETTO": 1508,
"MO_DESCRIZIONE": "FACEBOOK FastKaleiDoS - Rete EUROPA",
"MO_NET": "1.0.0.0/8",
"MO_AUTOMITIGATION": 1,
"MO_TEMPLATE_MITIGATION": "FACEBOOK-EU-AUTOMITIGATION",
"MO_PROATTIVITA_MITIGATION": 1,
"MO_CODICE_SERVIZIO": "",
"MO_BANDA": 10240000,
"MO_NOTE": "",
"MO_ATTIVAZIONE_ANNO": 2020,
"MO_ATTIVAZIONE_MESE": 4,
"MO_STATUS": 2,
"NOME_PROGETTO": "FACEBOOK FastKaleiDoS",
"ID_SERVIZIO": 100,
"SERVIZIO": "DDoS Management"
*/


    const columns = [
      {
        title: "SERIALE",
        align: "center",
     		width: 'auto',
        dataIndex: "SERIALE",
        key: "SERIALE",
        ...this.getColumnSearchProps('SERIALE'),
        render: (name, obj)  => (
          <Space size="small">
            <Device name={name} obj={obj} />
          </Space>
        ),
      },
      {
        title: "ID_PROGETTO",
        align: "center",
     		width: 'auto',
        dataIndex: "ID_PROGETTO",
        key: "ID_PROGETTO",
        ...this.getColumnSearchProps('ID_PROGETTO')
      },
      {
        title: "MODELLO",
        align: "center",
     		width: 'auto',
        dataIndex: "MODELLO",
        key: "MODELLO",
        ...this.getColumnSearchProps('MODELLO')
      },
      {
        title: "FIRMWARE",
        align: "center",
     		width: 'auto',
        dataIndex: "FIRMWARE",
        key: "FIRMWARE",
        ...this.getColumnSearchProps('FIRMWARE')
      },
      {
        title: "DESCRIZIONE",
        align: "center",
     		width: 250,
        dataIndex: "DESCRIZIONE",
        key: "DESCRIZIONE",
        ...this.getColumnSearchProps('DESCRIZIONE')
      },
      {
        title: "HA",
        align: "center",
     		width: 'auto',
        dataIndex: "HA",
        key: "HA",
        ...this.getColumnSearchProps('HA')
      },
      {
        title: "VDOM",
        align: "center",
     		width: 'auto',
        dataIndex: "VDOM",
        key: "VDOM",
        ...this.getColumnSearchProps('VDOM')
      },
      {
        title: "IP_MGMT",
        align: "center",
     		width: 'auto',
        dataIndex: "IP_MGMT",
        key: "IP_MGMT",
        ...this.getColumnSearchProps('IP_MGMT')
      },
      {
        title: "PORT_MGMT",
        align: "center",
     		width: 'auto',
        dataIndex: "PORT_MGMT",
        key: "PORT_MGMT",
        ...this.getColumnSearchProps('PORT_MGMT')
      },
      {
        title: "REVERSE",
        align: "center",
     		width: 'auto',
        dataIndex: "REVERSE",
        key: "REVERSE",
        ...this.getColumnSearchProps('REVERSE')
      },
      {
        title: "INDIRIZZO",
        align: "center",
     		width: 250,
        dataIndex: "INDIRIZZO",
        key: "INDIRIZZO",
        ...this.getColumnSearchProps('INDIRIZZO')
      },
      {
        title: "POSIZIONE",
        align: "center",
     		width: 'auto',
        dataIndex: "POSIZIONE",
        key: "POSIZIONE",
        ...this.getColumnSearchProps('POSIZIONE')
      },
      {
        title: "KEYMAKER",
        align: "center",
     		width: 'auto',
        dataIndex: "KEYMAKER",
        key: "KEYMAKER",
        ...this.getColumnSearchProps('KEYMAKER')
      },
      {
        title: "USERADMIN",
        align: "center",
     		width: 'auto',
        dataIndex: "USERADMIN",
        key: "USERADMIN",
        ...this.getColumnSearchProps('USERADMIN')
      },
      {
        title: "PUBLIC_NET",
        align: "center",
     		width: 'auto',
        dataIndex: "PUBLIC_NET",
        key: "PUBLIC_NET",
        ...this.getColumnSearchProps('PUBLIC_NET')
      },
      {
        title: "CODICE_SERVIZIO",
        align: "center",
     		width: 'auto',
        dataIndex: "CODICE_SERVIZIO",
        key: "CODICE_SERVIZIO",
        ...this.getColumnSearchProps('CODICE_SERVIZIO')
      },
      {
        title: "NOTE_APPARATO",
        align: "center",
     		width: 'auto',
        dataIndex: "NOTE_APPARATO",
        key: "NOTE_APPARATO",
        ...this.getColumnSearchProps('NOTE_APPARATO')
      },
      {
        title: "ASSISTENZA",
        align: "center",
     		width: 250,
        dataIndex: "ASSISTENZA",
        key: "ASSISTENZA",
        ...this.getColumnSearchProps('ASSISTENZA')
      },
      {
        title: "PROFILO",
        align: "center",
     		width: 'auto',
        dataIndex: "PROFILO",
        key: "PROFILO",
        ...this.getColumnSearchProps('PROFILO')
      },
      {
        title: "ATTIVAZIONE_ANNO",
        align: "center",
     		width: 'auto',
        dataIndex: "ATTIVAZIONE_ANNO",
        key: "ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps('ATTIVAZIONE_ANNO')
      },
      {
        title: "ATTIVAZIONE_MESE",
        align: "center",
     		width: 'auto',
        dataIndex: "ATTIVAZIONE_MESE",
        key: "ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps('ATTIVAZIONE_MESE')
      },
      {
        title: "DISK_STATUS",
        align: "center",
     		width: 'auto',
        dataIndex: "DISK_STATUS",
        key: "DISK_STATUS",
        ...this.getColumnSearchProps('DISK_STATUS')
      },
      {
        title: "AUTENTICAZIONE",
        align: "center",
     		width: 'auto',
        dataIndex: "AUTENTICAZIONE",
        key: "AUTENTICAZIONE",
        ...this.getColumnSearchProps('AUTENTICAZIONE')
      },
      {
        title: "SERVIZI",
        align: "center",
     		width: 'auto',
        dataIndex: "SERVIZI",
        key: "SERVIZI",
        ...this.getColumnSearchProps('SERVIZI')
      },
      {
        title: "ADDURL_MGMT",
        align: "center",
     		width: 'auto',
        dataIndex: "ADDURL_MGMT",
        key: "ADDURL_MGMT",
        ...this.getColumnSearchProps('ADDURL_MGMT')
      },
      {
        title: "SNMP_COMMUNITY",
        align: "center",
     		width: 'auto',
        dataIndex: "SNMP_COMMUNITY",
        key: "SNMP_COMMUNITY",
        ...this.getColumnSearchProps('SNMP_COMMUNITY')
      },
      {
        title: "SNMP_PORT",
        align: "center",
     		width: 'auto',
        dataIndex: "SNMP_PORT",
        key: "SNMP_PORT",
        ...this.getColumnSearchProps('SNMP_PORT')
      },
      {
        title: "STATUS_APPARATO",
        align: "center",
     		width: 'auto',
        dataIndex: "STATUS_APPARATO",
        key: "STATUS_APPARATO",
        ...this.getColumnSearchProps('STATUS_APPARATO')
      },
      {
        title: "BACKUP_SCRIPT",
        align: "center",
     		width: 'auto',
        dataIndex: "BACKUP_SCRIPT",
        key: "BACKUP_SCRIPT",
        ...this.getColumnSearchProps('BACKUP_SCRIPT')
      },
      {
        title: "BACKUP_STATUS",
        align: "center",
     		width: 'auto',
        dataIndex: "BACKUP_STATUS",
        key: "BACKUP_STATUS",
        ...this.getColumnSearchProps('BACKUP_STATUS')
      },
      {
        title: "BACKUP_TSTAMP",
        align: "center",
     		width: 'auto',
        dataIndex: "BACKUP_TSTAMP",
        key: "BACKUP_TSTAMP",
        ...this.getColumnSearchProps('BACKUP_TSTAMP')
      },
      {
        title: "BACKUP_CHECKSUM",
        align: "center",
     		width: 'auto',
        dataIndex: "BACKUP_CHECKSUM",
        key: "BACKUP_CHECKSUM",
        ...this.getColumnSearchProps('BACKUP_CHECKSUM')
      },
      {
        title: "detail",
        align: "center",
     		width: 'auto',
        dataIndex: "detail",
        key: "detail",
        ...this.getColumnSearchProps('detail')
      }
    ]

    return (
      <React.Fragment>
        <Table
          columns={columns}
          dataSource={this.props.devices}
          scroll={{ x: 'auto', y: 650}}
          bordered
          rowKey="SERIALE"
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  authorizations: state.authorizations.f5,
  devices: state.fortinetdb.devices,
}))(List);
