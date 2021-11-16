import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'

import Ddos from './ddos'

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

"SERVIZIO": "DDoS Management"
*/


    const columns = [
      {
        title: "MANAGED_OBJECT",
        align: "center",
     		width: 'auto',
        dataIndex: "MANAGED_OBJECT",
        key: "MANAGED_OBJECT",
        ...this.getColumnSearchProps('MANAGED_OBJECT'),
        render: (name, obj)  => (
          <Space size="small">
            <Ddos name={name} obj={obj} />
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
        title: "MO_DESCRIZIONE",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_DESCRIZIONE",
        key: "MO_DESCRIZIONE",
        ...this.getColumnSearchProps('MO_DESCRIZIONE')
      },
      {
        title: "MO_NET",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_NET",
        key: "MO_NET",
        ...this.getColumnSearchProps('MO_NET')
      },
      {
        title: "MO_AUTOMITIGATION",
        align: "center",
     		width: 250,
        dataIndex: "MO_AUTOMITIGATION",
        key: "MO_AUTOMITIGATION",
        ...this.getColumnSearchProps('MO_AUTOMITIGATION')
      },
      {
        title: "MO_TEMPLATE_MITIGATION",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_TEMPLATE_MITIGATION",
        key: "MO_TEMPLATE_MITIGATION",
        ...this.getColumnSearchProps('MO_TEMPLATE_MITIGATION')
      },
      {
        title: "MO_PROATTIVITA_MITIGATION",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_PROATTIVITA_MITIGATION",
        key: "MO_PROATTIVITA_MITIGATION",
        ...this.getColumnSearchProps('MO_PROATTIVITA_MITIGATION')
      },
      {
        title: "MO_CODICE_SERVIZIO",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_CODICE_SERVIZIO",
        key: "MO_CODICE_SERVIZIO",
        ...this.getColumnSearchProps('MO_CODICE_SERVIZIO')
      },
      {
        title: "MO_BANDA",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_BANDA",
        key: "MO_BANDA",
        ...this.getColumnSearchProps('MO_BANDA')
      },
      {
        title: "MO_NOTE",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_NOTE",
        key: "MO_NOTE",
        ...this.getColumnSearchProps('MO_NOTE')
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
     		width: 'auto',
        dataIndex: "MO_ATTIVAZIONE_MESE",
        key: "MO_ATTIVAZIONE_MESE",
        ...this.getColumnSearchProps('MO_ATTIVAZIONE_MESE')
      },
      {
        title: "MO_STATUS",
        align: "center",
     		width: 'auto',
        dataIndex: "MO_STATUS",
        key: "MO_STATUS",
        ...this.getColumnSearchProps('MO_STATUS')
      },
      {
        title: "NOME_PROGETTO",
        align: "center",
     		width: 'auto',
        dataIndex: "NOME_PROGETTO",
        key: "NOME_PROGETTO",
        ...this.getColumnSearchProps('NOME_PROGETTO')
      },
      {
        title: "ID_SERVIZIO",
        align: "center",
     		width: 'auto',
        dataIndex: "ID_SERVIZIO",
        key: "ID_SERVIZIO",
        ...this.getColumnSearchProps('ID_SERVIZIO')
      },
      {
        title: "SERVIZIO",
        align: "center",
     		width: 'auto',
        dataIndex: "SERVIZIO",
        key: "SERVIZIO",
        ...this.getColumnSearchProps('SERVIZIO')
      }
    ]

    return (
      <React.Fragment>
        <Table
          columns={columns}
          dataSource={this.props.ddosses}
          scroll={{ x: 'auto', y: 650}}
          bordered
          rowKey="MANAGED_OBJECT"
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
  ddosses: state.fortinetdb.ddosses,
}))(List);
