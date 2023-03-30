import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  f5objects,
  f5objectsLoading,
  f5objectsError,
  f5objectDeleteError
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Alert, Result, Button, Spin, Divider, Row, Col, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinGetIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class DeleteF5Node extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      request: {}
    };
  }

  componentDidMount() {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) ) {
        this.f5objectsGet()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.f5objectsGet()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  f5objectsGet = async () => {
    let f5object = this.props.f5object
    this.props.dispatch(f5objectsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(f5objects(resp))
      },
      error => {
        this.props.dispatch(f5objectsError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${f5object}s/`, this.props.token)
    this.props.dispatch(f5objectsLoading(false))
  }

  f5objectNameSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.f5objectName = e
    await this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.f5objectName) {
      errors.f5objectNameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.f5objectNameError
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.f5objectDelete()
    }

  }

  f5objectDelete = async () => {
    let f5object = this.props.f5object
    this.setState({loading: true})

    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true})
        this.response()
      },
      error => {
        this.props.dispatch(f5objectDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/${f5object}/${this.state.request.f5objectName}/`, this.props.token )

  }

  response = () => {
    //setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
      request: {}
    })
  }


  render() {
    let f5object = this.props.f5object
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>DELETE {f5object.toUpperCase()}</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>DELETE {f5object.toUpperCase()}</p>}
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
                   title={`${f5object} deleted`}
                 />
              }

              {!this.state.loading && !this.state.response ?
                <React.Fragment>
                  <Row>
                    <Col offset={2} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>{f5object} Name:</p>
                    </Col>
                    <Col span={16}>
                      { this.props.f5objectsLoading ?
                        <Spin indicator={spinGetIcon} style={{ margin: '0 10%'}}/>
                      :
                        <React.Fragment>
                          { this.props.f5objects && this.props.f5objects.length > 0 ?
                            <Select
                              defaultValue={this.state.request.f5objectName}
                              value={this.state.request.f5objectName}
                              showSearch
                              style={this.state.errors.f5objectNameError ? {width: 450, border: `1px solid red`} : {width: 450}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.f5objectNameSet(n)}
                            >
                              <React.Fragment>
                                {this.props.f5objects.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            null
                          }
                        </React.Fragment>
                      }
                    </Col>
                  </Row>

                  <br/>

                  <Row>
                    <Col offset={2} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove {f5object}:</p>
                    </Col>
                    <Col span={16}>
                      <Button type="danger" onClick={() => this.validation()}>
                        Delete {f5object}
                      </Button>
                    </Col>
                  </Row>

                  <br/>

                </React.Fragment>
              :
                null
              }
            </React.Fragment>
          :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.f5objectsError ? <Error component={`delete ${f5object}`} error={[this.props.f5objectsError]} visible={true} type={'f5objectsError'} /> : null }
            { this.props.f5objectDeleteError ? <Error component={`delete ${f5object}`} error={[this.props.f5objectDeleteError]} visible={true} type={'f5objectDeleteError'} /> : null }
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
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  f5objects: state.f5.f5objects,
  f5objectsLoading: state.f5.f5objectsLoading,

  f5objectsError: state.f5.f5objectsError,
  f5objectDeleteError: state.f5.f5objectDeleteError
}))(DeleteF5Node);
