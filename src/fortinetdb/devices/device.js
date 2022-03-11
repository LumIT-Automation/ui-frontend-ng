import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../../error/fortinetdbError'

import {
  deviceError
} from '../store.fortinetdb'

import { Input, Button, Space, Modal, Table } from 'antd'

import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'



class Device extends React.Component {

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
        let device = [resp.data]
        this.setState({loading: false, device: device, extraData: resp.data.extra_data})
      },
      error => {
        this.props.dispatch(deviceError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`fortinetdb/device/${this.props.obj.SERIALE}/`, this.props.token)
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
          this.fetchDevice()
        },
        error => {
          this.props.dispatch(deviceError(error))
          this.setState({extraLoading: false, response: false, error: error})
        }
      )
      await rest.doXHR(`/fortinetdb/device/${this.props.obj.SERIALE}/`, this.props.token, b )
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
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
        title: "SERIALE",
        align: "center",
     		width: 150,
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
        title: "MODELLO",
        align: "center",
     		width: 150,
        dataIndex: "MODELLO",
        key: "MODELLO",
        ...this.getColumnSearchProps('MODELLO')
      },
      {
        title: "FIRMWARE",
        align: "center",
     		width: 150,
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
     		width: 150,
        dataIndex: "HA",
        key: "HA",
        ...this.getColumnSearchProps('HA')
      },
      {
        title: "VDOM",
        align: "center",
     		width: 150,
        dataIndex: "VDOM",
        key: "VDOM",
        ...this.getColumnSearchProps('VDOM')
      },
      {
        title: "ATTIVAZIONE_ANNO",
        align: "center",
     		width: 200,
        dataIndex: "ATTIVAZIONE_ANNO",
        key: "ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps('ATTIVAZIONE_ANNO')
      },
      {
        title: "ATTIVAZIONE_MESE",
        align: "center",
     		width: 200,
        dataIndex: "ATTIVAZIONE_MESE",
        key: "ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps('ATTIVAZIONE_MESE')
      },
      {
        title: "STATUS_APPARATO",
        align: "center",
     		width: 200,
        dataIndex: "STATUS_APPARATO",
        key: "STATUS_APPARATO",
        ...this.getColumnSearchProps('STATUS_APPARATO')
      },
      {
        title: "BACKUP_STATUS",
        align: "center",
     		width: 200,
        dataIndex: "BACKUP_STATUS",
        key: "BACKUP_STATUS",
        ...this.getColumnSearchProps('BACKUP_STATUS')
      },
      {
        title: "VENDOR",
        align: "center",
     		width: 150,
        dataIndex: "VENDOR",
        key: "VENDOR",
        ...this.getColumnSearchProps('VENDOR')
      },
      {
        title: "EOL_ANNO",
        align: "center",
     		width: 200,
        dataIndex: "EOL_ANNO",
        key: "EOL_ANNO",
        ...this.getColumnSearchProps('EOL_ANNO')
      },
      {
        title: "EOL_MESE",
        align: "center",
        width: 200,
        dataIndex: "EOL_MESE",
        key: "EOL_MESE",
        ...this.getColumnSearchProps('EOL_MESE')
      },
      {
        title: "COMUNE",
        align: "center",
        width: 150,
        columnWidth: 'auto',
        dataIndex: "comune",
        key: "comune",
        ...this.getColumnSearchProps('comune')
      },
      {
        title: "PROVINCIA",
        align: "center",
        width: 150,
        dataIndex: "provincia",
        key: "provincia",
        ...this.getColumnSearchProps('provincia')
      },
      {
        title: "REGIONE",
        align: "center",
        width: 150,
        dataIndex: "regione",
        key: "regione",
        ...this.getColumnSearchProps('regione')
      },
      {
        title: "detail",
        align: "center",
     		width: 150,
        dataIndex: "detail",
        key: "detail",
        ...this.getColumnSearchProps('detail')
      }
    ]

    return (
      <React.Fragment>
        <Button type='primary' onClick={() => this.details()} shape='round'>
          {this.props.obj.SERIALE}
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Device</p>}
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
            rowKey="SERIALE"
            layout="vertical"
            pagination={false}
            style={{ width: 'auto', marginBottom: 10}}
            scroll={{x: 'auto'}}
          >
          </Table>
        </Modal>

        {this.state.visible ?
          <React.Fragment>

            { this.props.deviceError ? <Error component={'fortinetdb device'} error={[this.props.deviceError]} visible={true} type={'deviceError'} /> : null }

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
 	deviceError: state.fortinetdb.deviceError
}))(Device);
