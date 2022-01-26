import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import { Input, Button, Space, Modal, Table } from 'antd'

import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'


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
    this.fetchProject()
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
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`fortinetdb/project/${this.props.obj.ID_PROGETTO}/`, this.props.token)
  }

  setExtraData = e => {
    this.setState({extraData: e})
  }

  modifyExtraData = async e => {
    this.setState({extraLoading: true})
    if (e.target && e.target.value) {
      const b = {
        "data": {
          "extra_data": e.target.value
        }
      }
      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({extraLoading: false})
          this.fetchProject()
        },
        error => {
          this.setState({extraLoading: false, response: false, error: error})
        }
      )
      await rest.doXHR(`/fortinetdb/project/${this.props.obj.ID_PROGETTO}/`, this.props.token, b )
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
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
    const columns = [
      {
        title: "ID_PROGETTO",
        align: "center",
        width: "auto",
        dataIndex: "ID_PROGETTO",
        key: "ID_PROGETTO",
        ...this.getColumnSearchProps("ID_PROGETTO")
      },
      {
        title: "NOME",
        align: "center",
        width: "auto",
        dataIndex: "NOME",
        key: "NOME",
        ...this.getColumnSearchProps("NOME")
      },
      {
        title: "ID_SERVIZIO",
        align: "center",
        width: "auto",
        dataIndex: "ID_SERVIZIO",
        key: "ID_SERVIZIO",
        ...this.getColumnSearchProps("ID_SERVIZIO")
      },
      {
        title: "NOTE_PROGETTO",
        align: "center",
        width: "auto",
        dataIndex: "NOTE_PROGETTO",
        key: "NOTE_PROGETTO",
        ...this.getColumnSearchProps("NOTE_PROGETTO")
      },
      {
        title: "INFO_PROGETTO",
        align: "center",
        width: "auto",
        dataIndex: "INFO_PROGETTO",
        key: "INFO_PROGETTO",
        ...this.getColumnSearchProps("INFO_PROGETTO")
      },
      {
        title: "ATTENZIONE_PROGETTO",
        align: "center",
        width: "auto",
        dataIndex: "ATTENZIONE_PROGETTO",
        key: "ATTENZIONE_PROGETTO",
        ...this.getColumnSearchProps("ATTENZIONE_PROGETTO")
      },
      {
        title: "SERVIZIO",
        align: "center",
        width: "auto",
        dataIndex: "SERVIZIO",
        key: "SERVIZIO",
        ...this.getColumnSearchProps("SERVIZIO")
      },
      {
        title: "ACCOUNT",
        align: "center",
        width: "auto",
        dataIndex: "ACCOUNT",
        key: "ACCOUNT",
        ...this.getColumnSearchProps("ACCOUNT")
      },
      {
        title: "RAGIONE_SOCIALE",
        align: "center",
        width: "auto",
        dataIndex: "RAGIONE_SOCIALE",
        key: "RAGIONE_SOCIALE",
        ...this.getColumnSearchProps("RAGIONE_SOCIALE")
      },
      {
        title: "ALIAS",
        align: "center",
        width: "auto",
        dataIndex: "ALIAS",
        key: "ALIAS",
        ...this.getColumnSearchProps("ALIAS")
      },
      {
        title: "SEGMENTO",
        align: "center",
        width: "auto",
        dataIndex: "SEGMENTO",
        key: "SEGMENTO",
        ...this.getColumnSearchProps("SEGMENTO")
      },
      {
        title: "RIFERIMENTO_NOME_1",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_NOME_1",
        key: "RIFERIMENTO_NOME_1",
        ...this.getColumnSearchProps("RIFERIMENTO_NOME_1")
      },
      {
        title: "RIFERIMENTO_TEL_1",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_TEL_1",
        key: "RIFERIMENTO_TEL_1",
        ...this.getColumnSearchProps("RIFERIMENTO_TEL_1")
      },
      {
        title: "RIFERIMENTO_EMAIL_1",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_EMAIL_1",
        key: "RIFERIMENTO_EMAIL_1",
        ...this.getColumnSearchProps("RIFERIMENTO_EMAIL_1")
      },
      {
        title: "RIFERIMENTO_NOME_2",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_NOME_2",
        key: "RIFERIMENTO_NOME_2",
        ...this.getColumnSearchProps("RIFERIMENTO_NOME_2")
      },
      {
        title: "RIFERIMENTO_TEL_2",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_TEL_2",
        key: "RIFERIMENTO_TEL_2",
        ...this.getColumnSearchProps("RIFERIMENTO_TEL_2")
      },
      {
        title: "RIFERIMENTO_EMAIL_2",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_EMAIL_2",
        key: "RIFERIMENTO_EMAIL_2",
        ...this.getColumnSearchProps("RIFERIMENTO_EMAIL_2")
      },
      {
        title: "RIFERIMENTO_NOME_3",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_NOME_3",
        key: "RIFERIMENTO_NOME_3",
        ...this.getColumnSearchProps("RIFERIMENTO_NOME_3")
      },
      {
        title: "RIFERIMENTO_TEL_3",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_TEL_3",
        key: "RIFERIMENTO_TEL_3",
        ...this.getColumnSearchProps("RIFERIMENTO_TEL_3")
      },
      {
        title: "RIFERIMENTO_EMAIL_3",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_EMAIL_3",
        key: "RIFERIMENTO_EMAIL_3",
        ...this.getColumnSearchProps("RIFERIMENTO_EMAIL_3")
      },
      {
        title: "RIFERIMENTO_NOME_4",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_NOME_4",
        key: "RIFERIMENTO_NOME_4",
        ...this.getColumnSearchProps("RIFERIMENTO_NOME_4")
      },
      {
        title: "RIFERIMENTO_TEL_4",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_TEL_4",
        key: "RIFERIMENTO_TEL_4",
        ...this.getColumnSearchProps("RIFERIMENTO_TEL_4")
      },
      {
        title: "RIFERIMENTO_EMAIL_4",
        align: "center",
        width: "auto",
        dataIndex: "RIFERIMENTO_EMAIL_4",
        key: "RIFERIMENTO_EMAIL_4",
        ...this.getColumnSearchProps("RIFERIMENTO_EMAIL_4")
      },
      {
        title: "ID_PM",
        align: "center",
        width: "auto",
        dataIndex: "ID_PM",
        key: "ID_PM",
        ...this.getColumnSearchProps("ID_PM")
      },
      {
        title: "SERIALE",
        align: "center",
        width: "auto",
        dataIndex: "SERIALE",
        key: "SERIALE",
        ...this.getColumnSearchProps("SERIALE")
      },
      {
        title: "MODELLO",
        align: "center",
        width: "auto",
        dataIndex: "MODELLO",
        key: "MODELLO",
        ...this.getColumnSearchProps("MODELLO")
      },
      {
        title: "FIRMWARE",
        align: "center",
        width: "auto",
        dataIndex: "FIRMWARE",
        key: "FIRMWARE",
        ...this.getColumnSearchProps("FIRMWARE")
      },
      {
        title: "DESCRIZIONE",
        align: "center",
        width: "auto",
        dataIndex: "DESCRIZIONE",
        key: "DESCRIZIONE",
        ...this.getColumnSearchProps("DESCRIZIONE")
      },
      {
        title: "HA",
        align: "center",
        width: "auto",
        dataIndex: "HA",
        key: "HA",
        ...this.getColumnSearchProps("HA")
      },
      {
        title: "VDOM",
        align: "center",
        width: "auto",
        dataIndex: "VDOM",
        key: "VDOM",
        ...this.getColumnSearchProps("VDOM")
      },
      {
        title: "IP_MGMT",
        align: "center",
        width: "auto",
        dataIndex: "IP_MGMT",
        key: "IP_MGMT",
        ...this.getColumnSearchProps("IP_MGMT")
      },
      {
        title: "PORT_MGMT",
        align: "center",
        width: "auto",
        dataIndex: "PORT_MGMT",
        key: "PORT_MGMT",
        ...this.getColumnSearchProps("PORT_MGMT")
      },
      {
        title: "REVERSE",
        align: "center",
        width: "auto",
        dataIndex: "REVERSE",
        key: "REVERSE",
        ...this.getColumnSearchProps("REVERSE")
      },
      {
        title: "INDIRIZZO",
        align: "center",
        width: "auto",
        dataIndex: "INDIRIZZO",
        key: "INDIRIZZO",
        ...this.getColumnSearchProps("INDIRIZZO")
      },
      {
        title: "POSIZIONE",
        align: "center",
        width: "auto",
        dataIndex: "POSIZIONE",
        key: "POSIZIONE",
        ...this.getColumnSearchProps("POSIZIONE")
      },
      {
        title: "KEYMAKER",
        align: "center",
        width: "auto",
        dataIndex: "KEYMAKER",
        key: "KEYMAKER",
        ...this.getColumnSearchProps("KEYMAKER")
      },
      {
        title: "USERADMIN",
        align: "center",
        width: "auto",
        dataIndex: "USERADMIN",
        key: "USERADMIN",
        ...this.getColumnSearchProps("USERADMIN")
      },
      {
        title: "PUBLIC_NET",
        align: "center",
        width: "auto",
        dataIndex: "PUBLIC_NET",
        key: "PUBLIC_NET",
        ...this.getColumnSearchProps("PUBLIC_NET")
      },
      {
        title: "CODICE_SERVIZIO",
        align: "center",
        width: "auto",
        dataIndex: "CODICE_SERVIZIO",
        key: "CODICE_SERVIZIO",
        ...this.getColumnSearchProps("CODICE_SERVIZIO")
      },
      {
        title: "NOTE_APPARATO",
        align: "center",
        width: "auto",
        dataIndex: "NOTE_APPARATO",
        key: "NOTE_APPARATO",
        ...this.getColumnSearchProps("NOTE_APPARATO")
      },
      {
        title: "ASSISTENZA",
        align: "center",
        width: "auto",
        dataIndex: "ASSISTENZA",
        key: "ASSISTENZA",
        ...this.getColumnSearchProps("ASSISTENZA")
      },
      {
        title: "PROFILO",
        align: "center",
        width: "auto",
        dataIndex: "PROFILO",
        key: "PROFILO",
        ...this.getColumnSearchProps("PROFILO")
      },
      {
        title: "ATTIVAZIONE_ANNO",
        align: "center",
        width: "auto",
        dataIndex: "ATTIVAZIONE_ANNO",
        key: "ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps("ATTIVAZIONE_ANNO")
      },
      {
        title: "ATTIVAZIONE_MESE",
        align: "center",
        width: "auto",
        dataIndex: "ATTIVAZIONE_MESE",
        key: "ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps("ATTIVAZIONE_MESE")
      },
      {
        title: "DISK_STATUS",
        align: "center",
        width: "auto",
        dataIndex: "DISK_STATUS",
        key: "DISK_STATUS",
        ...this.getColumnSearchProps("DISK_STATUS")
      },
      {
        title: "AUTENTICAZIONE",
        align: "center",
        width: "auto",
        dataIndex: "AUTENTICAZIONE",
        key: "AUTENTICAZIONE",
        ...this.getColumnSearchProps("AUTENTICAZIONE")
      },
      {
        title: "SERVIZI",
        align: "center",
        width: "auto",
        dataIndex: "SERVIZI",
        key: "SERVIZI",
        ...this.getColumnSearchProps("SERVIZI")
      },
      {
        title: "ADDURL_MGMT",
        align: "center",
        width: "auto",
        dataIndex: "ADDURL_MGMT",
        key: "ADDURL_MGMT",
        ...this.getColumnSearchProps("ADDURL_MGMT")
      },
      {
        title: "SNMP_COMMUNITY",
        align: "center",
        width: "auto",
        dataIndex: "SNMP_COMMUNITY",
        key: "SNMP_COMMUNITY",
        ...this.getColumnSearchProps("SNMP_COMMUNITY")
      },
      {
        title: "SNMP_PORT",
        align: "center",
        width: "auto",
        dataIndex: "SNMP_PORT",
        key: "SNMP_PORT",
        ...this.getColumnSearchProps("SNMP_PORT")
      },
      {
        title: "HA_GROUPID",
        align: "center",
        width: "auto",
        dataIndex: "HA_GROUPID",
        key: "HA_GROUPID",
        ...this.getColumnSearchProps("HA_GROUPID")
      },
      {
        title: "STATUS_APPARATO",
        align: "center",
        width: "auto",
        dataIndex: "STATUS_APPARATO",
        key: "STATUS_APPARATO",
        ...this.getColumnSearchProps("STATUS_APPARATO")
      },
      {
        title: "BACKUP_SCRIPT",
        align: "center",
        width: "auto",
        dataIndex: "BACKUP_SCRIPT",
        key: "BACKUP_SCRIPT",
        ...this.getColumnSearchProps("BACKUP_SCRIPT")
      },
      {
        title: "BACKUP_STATUS",
        align: "center",
        width: "auto",
        dataIndex: "BACKUP_STATUS",
        key: "BACKUP_STATUS",
        ...this.getColumnSearchProps("BACKUP_STATUS")
      },
      {
        title: "BACKUP_TSTAMP",
        align: "center",
        width: "auto",
        dataIndex: "BACKUP_TSTAMP",
        key: "BACKUP_TSTAMP",
        ...this.getColumnSearchProps("BACKUP_TSTAMP")
      },
      {
        title: "BACKUP_CHECKSUM",
        align: "center",
        width: "auto",
        dataIndex: "BACKUP_CHECKSUM",
        key: "BACKUP_CHECKSUM",
        ...this.getColumnSearchProps("BACKUP_CHECKSUM")
      },
      {
        title: "MANAGED_OBJECT",
        align: "center",
        width: "auto",
        dataIndex: "MANAGED_OBJECT",
        key: "MANAGED_OBJECT",
        ...this.getColumnSearchProps("MANAGED_OBJECT")
      },
      {
        title: "MO_DESCRIZIONE",
        align: "center",
        width: "auto",
        dataIndex: "MO_DESCRIZIONE",
        key: "MO_DESCRIZIONE",
        ...this.getColumnSearchProps("MO_DESCRIZIONE")
      },
      {
        title: "MO_NET",
        align: "center",
        width: "auto",
        dataIndex: "MO_NET",
        key: "MO_NET",
        ...this.getColumnSearchProps("MO_NET")
      },
      {
        title: "MO_AUTOMITIGATION",
        align: "center",
        width: "auto",
        dataIndex: "MO_AUTOMITIGATION",
        key: "MO_AUTOMITIGATION",
        ...this.getColumnSearchProps("MO_AUTOMITIGATION")
      },
      {
        title: "MO_TEMPLATE_MITIGATION",
        align: "center",
        width: "auto",
        dataIndex: "MO_TEMPLATE_MITIGATION",
        key: "MO_TEMPLATE_MITIGATION",
        ...this.getColumnSearchProps("MO_TEMPLATE_MITIGATION")
      },
      {
        title: "MO_PROATTIVITA_MITIGATION",
        align: "center",
        width: "auto",
        dataIndex: "MO_PROATTIVITA_MITIGATION",
        key: "MO_PROATTIVITA_MITIGATION",
        ...this.getColumnSearchProps("MO_PROATTIVITA_MITIGATION")
      },
      {
        title: "MO_CODICE_SERVIZIO",
        align: "center",
        width: "auto",
        dataIndex: "MO_CODICE_SERVIZIO",
        key: "MO_CODICE_SERVIZIO",
        ...this.getColumnSearchProps("MO_CODICE_SERVIZIO")
      },
      {
        title: "MO_BANDA",
        align: "center",
        width: "auto",
        dataIndex: "MO_BANDA",
        key: "MO_BANDA",
        ...this.getColumnSearchProps("MO_BANDA")
      },
      {
        title: "MO_NOTE",
        align: "center",
        width: "auto",
        dataIndex: "MO_NOTE",
        key: "MO_NOTE",
        ...this.getColumnSearchProps("MO_NOTE")
      },
      {
        title: "MO_ATTIVAZIONE_ANNO",
        align: "center",
        width: "auto",
        dataIndex: "MO_ATTIVAZIONE_ANNO",
        key: "MO_ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps("MO_ATTIVAZIONE_ANNO")
      },
      {
        title: "MO_ATTIVAZIONE_MESE",
        align: "center",
        width: "auto",
        dataIndex: "MO_ATTIVAZIONE_MESE",
        key: "MO_ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps("MO_ATTIVAZIONE_MESE")
      },
      {
        title: "MO_STATUS",
        align: "center",
        width: "auto",
        dataIndex: "MO_STATUS",
        key: "MO_STATUS",
        ...this.getColumnSearchProps("MO_STATUS")
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
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
}))(Project);
