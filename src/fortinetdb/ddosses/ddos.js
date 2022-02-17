import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/fortinetdbError'

import {
  ddosError
} from '../../_store/store.fortinetdb'

import { Input, Button, Space, Modal, Table } from 'antd'

import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'


class Ddos extends React.Component {

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
    this.fetchDdos()
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

  fetchDdos = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let ddos = [resp.data]
        this.setState({loading: false, ddos: ddos, extraData: resp.data.extra_data})
      },
      error => {
        this.props.dispatch(ddosError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`fortinetdb/ddos/${this.props.obj.MANAGED_OBJECT}/`, this.props.token)
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
          this.fetchDdos()
        },
        error => {
          this.setState({extraLoading: false, response: false, error: error})
        }
      )
      await rest.doXHR(`/fortinetdb/ddos/${this.props.obj.MANAGED_OBJECT}/`, this.props.token, b )
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
        title: "MANAGED_OBJECT",
        align: "center",
     		width: 200,
        dataIndex: "MANAGED_OBJECT",
        key: "MANAGED_OBJECT",
        ...this.getColumnSearchProps('MANAGED_OBJECT'),
      },
      {
        title: "MO_DESCRIZIONE",
        align: "center",
     		width: 200,
        dataIndex: "MO_DESCRIZIONE",
        key: "MO_DESCRIZIONE",
        ...this.getColumnSearchProps('MO_DESCRIZIONE')
      },
      {
        title: "MO_NET",
        align: "center",
     		width: 200,
        dataIndex: "MO_NET",
        key: "MO_NET",
        ...this.getColumnSearchProps('MO_NET')
      },
      {
        title: "MO_AUTOMITIGATION",
        align: "center",
     		width: 200,
        dataIndex: "MO_AUTOMITIGATION",
        key: "MO_AUTOMITIGATION",
        ...this.getColumnSearchProps('MO_AUTOMITIGATION')
      },
      {
        title: "MO_BANDA",
        align: "center",
        width: 200,
        dataIndex: "MO_BANDA",
        key: "MO_BANDA",
        ...this.getColumnSearchProps('MO_BANDA')
      },
      {
        title: "MO_ATTIVAZIONE_ANNO",
        align: "center",
     		width: 250,
        dataIndex: "MO_ATTIVAZIONE_ANNO",
        key: "MO_ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps('MO_ATTIVAZIONE_ANNO')
      },
      {
        title: "MO_ATTIVAZIONE_MESE",
        align: "center",
     		width: 250,
        dataIndex: "MO_ATTIVAZIONE_MESE",
        key: "MO_ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps('MO_ATTIVAZIONE_MESE')
      },
      {
        title: "MO_STATUS",
        align: "center",
     		width: 200,
        dataIndex: "MO_STATUS",
        key: "MO_STATUS",
        ...this.getColumnSearchProps('MO_STATUS')
      },
    ]

    return (
      <React.Fragment>
        <Button type='primary' onClick={() => this.details()} shape='round'>
          {this.props.obj.MANAGED_OBJECT}
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Ddos</p>}
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
            dataSource={this.state.ddos}
            bordered
            rowKey="MANAGED_OBJECT"
            layout="vertical"
            pagination={false}
            style={{ width: 'auto', marginBottom: 10}}
            scroll={{x: 'auto'}}
          >
          </Table>
        </Modal>

        {this.state.visible ?
          <React.Fragment>

            { this.props.ddosError ? <Error component={'fortinetdb ddos'} error={[this.props.ddosError]} visible={true} type={'ddosError'} /> : null }

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
 	ddosError: state.fortinetdb.ddosError
}))(Ddos);
