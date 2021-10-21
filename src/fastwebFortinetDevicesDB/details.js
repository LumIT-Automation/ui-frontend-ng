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
    let data = []
    data.push(this.props.data)
    this.setState({data: data})
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

    console.log(this.props.obj)

    const columns = [
      {
        title: "SERIALE",
        width: 'auto',
        align: "center",
        dataIndex: "SERIALE",
        key: "SERIALE",
        ...this.getColumnSearchProps('SERIALE'),
      },
      {
        title: "ID_PROGETTO",
        align: "center",
        dataIndex: "ID_PROGETTO",
        key: "ID_PROGETTO",
        ...this.getColumnSearchProps('ID_PROGETTO')
      },
      {
        title: "MODELLO",
        width: 'auto',
        align: "center",
        dataIndex: "MODELLO",
        key: "MODELLO",
        ...this.getColumnSearchProps('MODELLO')
      },
      {
        title: "FIRMWARE",
        width: 'auto',
        align: "center",
        dataIndex: "FIRMWARE",
        key: "FIRMWARE",
        ...this.getColumnSearchProps('FIRMWARE')
      },
      {
        title: "DESCRIZIONE",
        width: 'auto',
        align: "center",
        dataIndex: "DESCRIZIONE",
        key: "DESCRIZIONE",
        ...this.getColumnSearchProps('DESCRIZIONE')
      },
      {
        title: "IP_MGMT",
        width: 'auto',
        align: "center",
        dataIndex: "IP_MGMT",
        key: "IP_MGMT",
        ...this.getColumnSearchProps('IP_MGMT')
      },
      {
        title: "INDIRIZZO",
        width: 'auto',
        align: "center",
        dataIndex: "INDIRIZZO",
        key: "INDIRIZZO",
        ...this.getColumnSearchProps('INDIRIZZO')
      },
      {
        title: "ASSISTENZA",
        width: 'auto',
        align: "center",
        dataIndex: "ASSISTENZA",
        key: "ASSISTENZA",
        ...this.getColumnSearchProps('ASSISTENZA')
      },
      {
        title: "PROFILO",
        width: 'auto',
        align: "center",
        dataIndex: "PROFILO",
        key: "PROFILO",
        ...this.getColumnSearchProps('PROFILO')
      },
      {
        title: "ATTIVAZIONE_ANNO",
        width: 'auto',
        align: "center",
        dataIndex: "ATTIVAZIONE_ANNO",
        key: "ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps('ATTIVAZIONE_ANNO')
      },
      {
        title: "SERIALE",
        width: 'auto',
        align: "center",
        dataIndex: "SERIALE",
        key: "SERIALE",
        ...this.getColumnSearchProps('SERIALE'),
      },
      {
        title: "ID_PROGETTO",
        align: "center",
        dataIndex: "ID_PROGETTO",
        key: "ID_PROGETTO",
        ...this.getColumnSearchProps('ID_PROGETTO')
      },
      {
        title: "MODELLO",
        width: 'auto',
        align: "center",
        dataIndex: "MODELLO",
        key: "MODELLO",
        ...this.getColumnSearchProps('MODELLO')
      },
      {
        title: "FIRMWARE",
        width: 'auto',
        align: "center",
        dataIndex: "FIRMWARE",
        key: "FIRMWARE",
        ...this.getColumnSearchProps('FIRMWARE')
      },
      {
        title: "DESCRIZIONE",
        width: 'auto',
        align: "center",
        dataIndex: "DESCRIZIONE",
        key: "DESCRIZIONE",
        ...this.getColumnSearchProps('DESCRIZIONE')
      },
      {
        title: "IP_MGMT",
        width: 'auto',
        align: "center",
        dataIndex: "IP_MGMT",
        key: "IP_MGMT",
        ...this.getColumnSearchProps('IP_MGMT')
      },
      {
        title: "INDIRIZZO",
        width: 'auto',
        align: "center",
        dataIndex: "INDIRIZZO",
        key: "INDIRIZZO",
        ...this.getColumnSearchProps('INDIRIZZO')
      },
      {
        title: "ASSISTENZA",
        width: 'auto',
        align: "center",
        dataIndex: "ASSISTENZA",
        key: "ASSISTENZA",
        ...this.getColumnSearchProps('ASSISTENZA')
      },
      {
        title: "PROFILO",
        width: 'auto',
        align: "center",
        dataIndex: "PROFILO",
        key: "PROFILO",
        ...this.getColumnSearchProps('PROFILO')
      },
      {
        title: "ATTIVAZIONE_ANNO",
        width: 'auto',
        align: "center",
        dataIndex: "ATTIVAZIONE_ANNO",
        key: "ATTIVAZIONE_ANNO",
        ...this.getColumnSearchProps('ATTIVAZIONE_ANNO')
      },
    ]

    return (
      <Space direction='vertical'>

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
        >
          <Table
            columns={columns}
            dataSource={this.state.data}
            bordered
            rowKey="name"
            layout="vertical"
            //pagination={false}
            pagination={{ pageSize: 10 }}
            style={{ width: 'auto', marginBottom: 10}}
            scroll={{y: 300}}
          >
          </Table>
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
}))(Details);
