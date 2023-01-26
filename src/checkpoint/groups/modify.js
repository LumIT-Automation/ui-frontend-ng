import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  groupsFetch,
  groupModifyError,
  itemTypesError,

  hosts,
  groups,
  networks,
  addressRanges,

  hostsError,
  groupsError,
  networksError,
  addressRangesError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Radio } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      groupData: {},
      request: {},
      errors: {},
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( this.state.visible && (prevState.itemTypes !== this.state.itemTypes) && (this.state.itemTypes !== null))  {
      this.dataGet()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    let request = Object.assign({}, this.props.obj)
    this.setState({request: request})
  }

  //SETTERS
  itemTypesSet = e => {
    this.setState({itemTypes: e.target.value})
  }

  dataGet = async () => {
    let gData = JSON.parse(JSON.stringify(this.state.groupData))
    this.setState({dataLoading: true})

    let groupData = await this.groupDataGet()
    if (groupData.status && groupData.status !== 200 ) {
      this.props.dispatch(itemTypesError(groupData))
      this.setState({dataLoading: false})
    }
    else {
      switch(this.state.itemTypes) {
        case 'hosts':
          gData.hosts = groupData.data.items
          break;
        case 'groups':
          gData.groups = groupData.data.items
          break;
        case 'networks':
          gData.networks = groupData.data.items
          break;
        case 'address-ranges':
          gData['address-ranges'] = groupData.data.items
          break;
      }
      this.setState({groupData: gData})
    }

    let domainData = await this.domainDataGet()
    if (domainData.status && domainData.status !== 200 ) {
      switch(this.state.itemTypes) {
        case 'hosts':
          this.props.dispatch(hostsError(domainData))
          break;
        case 'groups':
          this.props.dispatch(groupsError(domainData))
          break;
        case 'networks':
          this.props.dispatch(networksError(domainData))
          break;
        case 'address-ranges':
          this.props.dispatch(addressRangesError(domainData))
          break;
      }
      this.setState({dataLoading: false})
    }
    else {
      switch(this.state.itemTypes) {
        case 'hosts':
          this.props.dispatch(hosts(domainData))
          break;
        case 'groups':
          this.props.dispatch(groups(domainData))
          break;
        case 'networks':
          this.props.dispatch(networks(domainData))
          break;
        case 'address-ranges':
          this.props.dispatch(addressRanges(domainData))
          break;
      }
    }
    this.setState({dataLoading: false})
  }

  groupDataGet = async () => {
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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/group/${this.props.obj.uid}/${this.state.itemTypes}/`, this.props.token)
    return r
  }

  domainDataGet = async () => {
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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/${this.state.itemTypes}/`, this.props.token)
    return r
  }

/*
  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.name) {
      errors.nameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.groupModify()
    }
  }



  //DISPOSAL ACTION
  groupModify = async () => {
    let request = Object.assign({}, this.state.request)
    let b = {}
    b.data = {
      "name": this.state.request.name,
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(groupModifyError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/groups/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(groupsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  */

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {}
    })
  }


  render() {
    console.log(this.state.itemTypes)
    console.log(this.state.groupData)
    console.log('hosts', this.props.hosts)
    console.log('groups', this.props.groups)
    console.log('networks', this.props.networks)
    console.log('addressRanges', this.props.addressRanges)

    return (
      <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY GROUP</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Updated"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={1} span={16}>
                  <Radio.Group onChange={e => this.itemTypesSet(e)} value={this.state.itemTypes}>
                    <Radio value={'hosts'}>hosts</Radio>
                    <Radio value={'groups'}>groups</Radio>
                    <Radio value={'networks'}>networks</Radio>
                    <Radio value={'address-ranges'}>address ranges</Radio>
                  </Radio.Group>
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={11} span={4}>
                  <Button type="primary" shape='round' onClick={null} >
                    Modify Group
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.itemTypesError ? <Error component={'modify group'} error={[this.props.itemTypesError]} visible={true} type={'itemTypesError'} /> : null }
            { this.props.hostsError ? <Error component={'modify group'} error={[this.props.hostsError]} visible={true} type={'hostsError'} /> : null }
            { this.props.groupsError ? <Error component={'modify group'} error={[this.props.groupsError]} visible={true} type={'groupsError'} /> : null }
            { this.props.networksError ? <Error component={'modify group'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
            { this.props.addressRangesError ? <Error component={'modify group'} error={[this.props.addressRangesError]} visible={true} type={'addressRangesError'} /> : null }
            { this.props.groupModifyError ? <Error component={'modify group'} error={[this.props.groupModifyError]} visible={true} type={'groupModifyError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  hosts: state.checkpoint.hosts,
  groups: state.checkpoint.groups,
  networks: state.checkpoint.networks,
  addressRanges: state.checkpoint.addressRanges,

  hostsError: state.checkpoint.hostsError,
  groupsError: state.checkpoint.groupsError,
  networksError: state.checkpoint.networksError,
  addressRangesError: state.checkpoint.addressRangesError,

  itemTypesError: state.checkpoint.itemTypesError,
  groupModifyError: state.checkpoint.groupModifyError
}))(Modify);
