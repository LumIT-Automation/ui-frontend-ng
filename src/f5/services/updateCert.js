import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Space, Radio, Button, Select, Spin, Divider, Checkbox, Table } from 'antd'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class UpdateCert extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};

    this.state = {
      visible: false,
      virtualServers: [],
      profiles: [],
      errors: {},
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.main()
      }
      if ( this.state.virtualServer !== prevState.virtualServer ) {
        this.getProfiles()
      }
    }
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

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {
    try {

      await this.setState({vsLoading: true})
      let vsFetched = await this.dataGet('virtualservers', this.props.partition)
      await this.setState({vsLoading: false})
      if (vsFetched.status && vsFetched.status !== 200 ) {
        let error = Object.assign(vsFetched, {
          component: 'updateCert',
          vendor: 'f5',
          errorType: 'vsError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        await this.setState({virtualServers: vsFetched.data.items})
      }

    }
    catch (error) {
      console.log(error)
    }
  }

  getProfiles = async () => {
    await this.setState({profLoading: true, profile: ''})
    let profilesFetched = await this.dataGet('profiles', this.props.partition)
    await this.setState({profLoading: false})
    if (profilesFetched.status && profilesFetched.status !== 200 ) {
      let error = Object.assign(profilesFetched, {
        component: 'updateCert',
        vendor: 'f5',
        errorType: 'profilesError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      await this.setState({profiles: profilesFetched.data.profiles})
    }
  }


  //FETCH
  dataGet = async (entity, partition) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    if (entity === 'profiles') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${partition}/virtualserver/${this.state.virtualServer.name}/?related=policies,profiles&profileType=client-ssl`, this.props.token)
    }
    else {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${partition}/${entity}/`, this.props.token)
    }
    return r
  }


  //SETTERS

  set = async (value, key, obj) => {

    if (key === 'virtualServer') {
      let virtualServers = JSON.parse(JSON.stringify(this.state.virtualServers))
      let virtualServer = virtualServers.find(v => v.name === value)
      await this.setState({virtualServer: virtualServer})
    }
    else if (key === 'profile') {
      let profiles = JSON.parse(JSON.stringify(this.state.profiles))
      let profile = profiles.find(v => v.name === value)
      await this.setState({profile: profile})
    }
    else {
      await this.setState({[key]: value})
    }

  }

  //VALIDATION
  validationCheck = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!this.state.certName) {
      errors.certNameError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.certNameError
      this.setState({errors: errors})
    }

    if (!this.state.certificate) {
      errors.certificateError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.certificateError
      this.setState({errors: errors})
    }

    if (!this.state.key) {
      errors.keyError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.keyError
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.updateHandler()
    }
  }

  updateHandler = async () => {
    let update = await this.updateProfile()
      if (update.status && update.status !== 200 ) {
        let error = Object.assign(update, {
          component: 'updateCert',
          vendor: 'f5',
          errorType: 'updateError'
        })
        await this.setState({loading: false})
        this.props.dispatch(err(error))
        return
      }
      else {
        await this.setState({loading: false, response: true}, () => this.response())
      }
  }

  updateProfile =  async (file) => {
    let body
    let r

    body = {
      "data": {
        "virtualServerName": this.state.virtualServer.name,
        "certificate": {
          "name": this.state.certName,
          "content_base64": btoa(this.state.certificate)
        },
        "key": {
          "name": this.state.certName,
          "content_base64": btoa(this.state.key)
        }
      }
    }

    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/workflow/client-ssl-profile/${this.state.profile.name}/`, this.props.token, body )
    return r
  }


  //DISPOSAL ACTION

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
      dgChoices: null,
      dgName: null,
      dr: false,
      nodes: [],
      errors: {}
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'updateCert') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }
    
    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              defaultValue={obj ? obj[key] : ''}
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => this.set(event.target.value, key)}
            />
          )

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={this.state[`${key}`]}
              onChange={event => this.set(event.target.value, key)}
              style=
              { this.state.errors[`${key}Error`] ?
                {borderColor: `red`}
              :
                {}
              }
            />
          )
          break;

        case 'select':
          return (
            <Select
              value={this.state[`${key}`] ? this.state[`${key}`].name : ''}
              showSearch
              style=
              { this.state.errors[`${key}Error`] ?
                {width: "100%", border: `1px solid red`}
              :
                {width: "100%"}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={n => this.set(n, key, obj)}
            >
              <React.Fragment>
                
              { this.state[`${choices}`] ?
                this.state[`${choices}`].map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                  )
                })
                :
                null
              }
              </React.Fragment>
            </Select>
          )

        default:
      }
    }

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>UPDATE CERT</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>UPDATE CERT</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='f5'/>

          <Divider/>

          { ( (this.props.asset && this.props.asset.id) && this.props.partition ) ?
            <React.Fragment>
              { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Profile Updated"
                 />
              }
              { !this.state.loading && !this.state.response &&
                <React.Fragment>

                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>VirtualServer:</p>
                    </Col>
                    <Col span={8}>
                      { this.state.vsLoading ?
                        <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                      :
                        <Col span={24}>
                          {createElement('select', 'virtualServer', 'virtualServers')}
                        </Col>
                      }
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Profilo SSL:</p>
                    </Col>
                    <Col span={8}>
                      { this.state.profLoading ?
                        <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                      :
                        <Col span={24}>
                          {createElement('select', 'profile', 'profiles')}
                        </Col>
                      }
                    </Col>
                  </Row>
                  <br/>


                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Certificate Name:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('input', 'certName')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Certificate:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'certificate')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'key')}
                    </Col>
                  </Row>
                  <br/>

                <Divider/>

                <Row>
                  <Col offset={8} span={16}>
                    <Button 
                      type="primary" 
                      shape='round'
                      disabled = {this.state.loading ? true : false} 
                      onClick={() => this.validation()} 
                    >
                      Update certificate
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

            }

            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {errors()}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
}))(UpdateCert);
