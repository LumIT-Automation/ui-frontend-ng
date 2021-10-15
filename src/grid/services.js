import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { setAssets as setF5Assets } from '../_store/store.f5'
import { setAssets as setInfobloxAssets } from '../_store/store.infoblox'

import ModalCustom from './modal'

import { Space, Modal, Table, Result, List, Typography, Input, Button, Row, Col, Collapse } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*

*/

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
}

class Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      list: [
        {
          service: 'F5 - Create Service'
        },
        {
          service: 'F5 - Delete Service'
        },
        {
          service: 'F5 - Pool Maintenance'
        },
        {
          service: 'INFOBLOX - Info IP'
        },
        {
          service: 'INFOBLOX - Request IP'
        },
        {
          service: 'INFOBLOX - Modify IP'
        },
        {
          service: 'INFOBLOX - Release IP'
        },
      ],
      body: {}
    };
  }

  componentDidMount() {
    if (this.props.f5Authorizations && (this.props.f5Authorizations.assets_get || this.props.f5Authorizations.any ) ) {
      this.fetchF5Assets()
    }
    if (this.props.infobloxAuthorizations && (this.props.infobloxAuthorizations.assets_get || this.props.infobloxAuthorizations.any ) ) {
      this.fetchInfobloxAssets()
    }
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

  fetchF5Assets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Assets( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchInfobloxAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setInfobloxAssets( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
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
        title: 'Service',
        align: 'center',
        dataIndex: 'service',
        key: 'service',
        ...this.getColumnSearchProps('service'),
      },
      {
        title: 'Run',
        align: 'center',
        dataIndex: 'run',
        key: 'run',
        render: (name, obj)  => (
          <Space size="small">
            <ModalCustom name={name} obj={obj} />
          </Space>
        ),
      },
    ];


    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>


          <Row>
            <Col offset={2} span={4}>
              Info IP
            </Col>
            <Col offset={2} span={4}>
              Request IP
            </Col>
            <Col offset={2} span={4}>
              Modify IP
            </Col>
            <Col offset={2} span={4}>
              Release IP
            </Col>
          </Row>
          <Row>
            <p>F5</p>
          </Row>
          <Row>
            <p>Check Point</p>
          </Row>






        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  f5Authorizations: state.authorizations.f5,
  infobloxAuthorizations: state.authorizations.infoblox,
  f5Assets: state.f5.assets,
  infobloxAssets: state.infoblox.assets
}))(Service);