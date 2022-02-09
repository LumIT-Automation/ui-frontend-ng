import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

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


  render() {
    console.log(this.props)

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
        title: "EOS_FIRWMARE",
        align: "center",
     		width: 200,
        dataIndex: "EOS_FIRWMARE",
        key: "EOS_FIRWMARE",
        ...this.getColumnSearchProps('EOS_FIRWMARE')
      },
      {
        title: "EOS_HARDWARE",
        align: "center",
        width: 200,
        dataIndex: "EOS_HARDWARE",
        key: "EOS_HARDWARE",
        ...this.getColumnSearchProps('EOS_HARDWARE')
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
