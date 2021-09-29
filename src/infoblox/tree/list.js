import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest"
import Error from '../../error'

import Ip from '../ip'

import { Tree, Table, Input, Button, Space, Spin, Modal, Collapse } from 'antd'

import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

const { Panel } = Collapse



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

  closeModal = () => {
    this.setState({
      visible: false,
    })
  }



  fetchIps = async network => {
    //this.props.dispatch(setTreeLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        //this.props.dispatch( setTree(resp) )
        console.log(resp.data[1].ipv4Info)
        this.setState({ipv4Info: resp.data[1].ipv4Info})
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network/${network}/?related=ip`, this.props.token)
    //this.props.dispatch(setTreeLoading(false))
    this.setState({visible: true})
  }



  resetError = () => {
    this.setState({ error: null})
  }

  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info)
    if (info.node.type === 'network') {
      let n = info.node.network
      n = n.split('/')
      n = n[0]
      this.fetchIps(n)
    }
    else {
      alert('nnnnnnnnnnn')
    }
    //this.setState({visible: true})
  }

  onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  }

  render() {

    const columns = [
      {
        title: 'ip_address',
        align: 'center',
        dataIndex: 'ip_address',
        key: 'ip_address',
        ...this.getColumnSearchProps('ip_address'),
      },
      {
        title: 'mac_address',
        align: 'center',
        dataIndex: 'mac_address',
        key: 'mac_address',
        ...this.getColumnSearchProps('mac_address'),
      },
      {
        title: 'status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        ...this.getColumnSearchProps('status'),
      },
      {
        title: 'Request',
        align: 'center',
        dataIndex: 'request',
        key: 'request',
        ...this.getColumnSearchProps('request'),
      },
      {
        title: 'modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        ...this.getColumnSearchProps('modify'),
      },
      {
        title: 'release',
        align: 'center',
        dataIndex: 'release',
        key: 'release',
        ...this.getColumnSearchProps('release'),
      },
    ];

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Tree
          defaultExpandAll
          showLine
          //defaultExpandedKeys={['0-0-0', '0-0-1']}
          //defaultSelectedKeys={['0-0-0', '0-0-1']}
          //defaultCheckedKeys={['0-0-0', '0-0-1']}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          treeData={this.props.tree}
        />
        { this.state.visible ?
          <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
            <Modal
              title={<p style={{textAlign: 'center'}}>IP INFO</p>}
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
              dataSource={this.state.ipv4Info}
              bordered
              rowKey="ip_address"
              //pagination={false}
              pagination={{ pageSize: 50 }}
              style={{marginBottom: 50}}
            />
            </Modal>
            {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
          </Space>
          :
          null
        }
        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.infoblox.asset,

  tree: state.infoblox.tree
}))(List);
