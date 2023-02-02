import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

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
      }
    ]

    return (
      <React.Fragment>
        { this.props.filteredDevices && this.props.filteredDevices.length ?
          <p>Devices: {this.props.filteredDevices.length}</p>
        :
          null
        }
        { this.props.devices && this.props.devices.length ?
          <p>Total Devices: {this.props.devices.length}</p>
        :
          null
        }

        <Table
          columns={columns}
          dataSource={this.props.filteredDevices || this.props.devices}
          scroll={{ x: 'auto', y: this.props.height}}
          bordered
          rowKey="SERIALE"
          //pagination={false}
          pagination={{ pageSize: this.props.pagination }}
          style={{marginBottom: 10}}
        />

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  authorizations: state.authorizations.f5,
  devices: state.fortinetdb.devices,
}))(List);
