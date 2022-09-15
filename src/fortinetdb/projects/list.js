import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Project from './project'

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

    const columns = [
      {
        title: "ID_PROGETTO",
        align: "center",
        width: 200,
        dataIndex: "ID_PROGETTO",
        key: "ID_PROGETTO",
        ...this.getColumnSearchProps("ID_PROGETTO"),
        render: (name, obj)  => (
          <Space size="small">
            <Project name={name} obj={obj} />
          </Space>
        ),
      },
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

    let randomKey = () => {
      return Math.random().toString()
    }


    return (
      <React.Fragment>
        { this.props.filteredProjects && this.props.filteredProjects.length ?
          <p>Projects: {this.props.filteredProjects.length}</p>
        :
          null
        }
        {this.props.totalUniqueProjects ?
          <p>Total unique Projects: {this.props.totalUniqueProjects}</p>
        :
          null
        }

        <Table
          columns={columns}
          dataSource={this.props.filteredProjects || this.props.projects}
          scroll={{ x: 'auto', y: 650}}
          bordered
          rowKey={randomKey}
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  authorizations: state.authorizations.f5,
  projects: state.fortinetdb.projects,
  totalUniqueProjects: state.fortinetdb.totalUniqueProjects
}))(List);
