import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Input, Select, Button, Divider, Spin, Row, Col, Card } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'


const spinIcon25 = <LoadingOutlined style={{ fontSize: 25 }} spin />
const spinIcon50 = <LoadingOutlined style={{ fontSize: 50 }} spin />


class RemoveHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      reportTypes: ["report-knowledge-assessment", "report-training", "report-phishing"],
      reports: [],
      file: '',
      fileName: '',
      size: '',
      type: '',
      binaryString: '',
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetToken !== prevProps.assetToken) {
      this.setState({reportType: '', reports: [], report: '' })
    } 
    if (this.props.asset !== prevProps.asset) {
      this.setState({reportType: '', reports: [], report: '' })
    } 
    if (this.state.reportType && (this.state.reportType !== prevState.reportType)) {
      this.main()
    } 
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
  }

  main = async() => {
    if (this.props.vendor && this.props.asset && this.state.reportType) {
      this.setState({reportsLoading: true})
      let data = await this.dataGet(this.state.reportType)
      console.log(data)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'report',
          vendor: 'proofpoint',
          errorType: 'reportsError'
        })
        this.props.dispatch(err(error))
        await this.setState({reportsLoading: false})
        return
      }
      else {
        await this.setState({reportsLoading: false, reports: data.data.items})
      }
    }
    
  }

  readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = res => {
        resolve(res.target.result);
      };
      reader.onerror = err => reject(err);
  
      reader.readAsBinaryString(file);
    });
  }

  set = async (key, value) => {
    if (key === 'reportType') {
      await this.setState({reportType: value, reportTypeError: false})
    }
    if (key === 'report') {
      await this.setState({report: value, reportError: false})
    }
    if (key === 'mailFrom') {
      await this.setState({mailFrom: value, mailFromError: false})
    }
    if (key === 'upload') {

      if (value) {
          this.setState({
            file: value,
            fileName: value.name,
            size: value.size,
            type: value.type
          })
          let t = await this.readFile(value)
          this.setState({binaryString: t})
      }
      else {
        //blank value while typing.
        this.setState({binaryString: ''})
      }

      await this.setState({binaryStringError: ''})
    }
  }

  validation = async () => {
    let errors = await this.validationCheck()
    if (errors === 0) {
      this.getReport()
    }
  }

  validationCheck = async () => {
    let errors = 0
    let validators = new Validators()

    if (!this.state.reportType) {
      ++errors
      await this.setState({reportTypeError: true})
    }
    if (!this.state.report) {
      ++errors
      await this.setState({reportError: true})
    }
    if (this.state.reportType === "report-phishing") {
      if (!this.state.mailFrom) {
        ++errors
        await this.setState({mailFromError: true})
      }
      if (!validators.mailAddress(this.state.mailFrom)) {
        ++errors
        await this.setState({mailFromError: true})
      }
      if (!this.state.binaryString) {
        ++errors
        await this.setState({binaryStringError: true})
      }
    }

    return errors
  }

  getReport = async () => {
    this.setState({reportLoading: true})
    let data = await this.dataPut(this.state.report)
    console.log(data)
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'report',
        vendor: 'proofpoint',
        errorType: 'reportError'
      })
      this.props.dispatch(err(error))
      await this.setState({reportLoading: false})
      return
    }
    else {
      await this.setState({reportLoading: false})
      try {
        data.blob().then((blob) => {
          // Creating new object of PDF file
          const fileURL = window.URL.createObjectURL(blob)
                
          // Setting various property values
          let link = document.createElement("a")
          link.title = this.state.report
          link.href = fileURL
          link.target = "_blank"
          link.click()
        });
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  dataGet = async (resource) => {
    let endpoint 
    let r
    let additionalHeaders

    endpoint = `${this.props.vendor}/${this.props.asset.id}/usecases/${resource}/`

    if (this.props.assetToken) {
      additionalHeaders = [{'X-User-Defined-Remote-API-Token': this.props.assetToken}]
    }

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, this.props.token, null, additionalHeaders )
    return r
  }

  dataPut = async (resource) => {
    let r
    let additionalHeaders
    let endpoint = `${this.props.vendor}/${this.props.asset.id}/usecases/${this.state.reportType}/`     

    let body = {}
    body.data = {
      "assignmentname" : this.state.report
    }

    if (this.state.reportType === "report-phishing") {
      body.data.mailFrom = this.state.mailFrom
      body.data.emailScreenshot = btoa(this.state.binaryString)
    }

    if (this.props.assetToken) {
      additionalHeaders = [{'X-User-Defined-Remote-API-Token': this.props.assetToken}]
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
    await rest.doXHR(endpoint, this.props.token, body, additionalHeaders )
    return r
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      reportTypes: [],
      reportType: "",
      reports: [],
      report: ""
    })
  }


  render() {
    console.log(this.state.mailFrom)
    console.log(this.state.mailFromError)

    let errors = () => {
      if (this.props.error && this.props.error.component === 'report') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    let createElement = (element, key, choices, obj, action) => {  

      switch (element) {

        case 'button':
          return (
            <Button
              type="primary"
              disabled={(this.state.reportType && this.state.report) ? false : true}
              onClick={() => this.validation()}
            >
              Get Your Report
            </Button>
          )

        case 'input':
          return (
            <Input
              value={this.state[key]}
              style=
                {this.state[`${key}Error`] ?
                  {borderColor: 'red', width: 200}
                :
                  {width: 200}
                }
              //ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value)}
            />          
          )

        case 'upload' :
          return (
            <React.Fragment>
              <Input 
                type="file"
                style=
                  { 
                    this.state[`binaryStringError`] ?
                    {borderColor: `red`, width: 350}
                  :
                    {width: 350}
                  }
                onChange={e => this.set('upload', e.target.files[0])} 
              />
              <Card>
                <p>Name: {this.state.fileName}</p>
                <p>Type: {this.state.type}</p>
                <p>Size: {this.state.size} Bytes</p>
              </Card>    
          </React.Fragment>    
          )

        case 'select':         
          return (
            <Select
              value={this.state[key]}
              showSearch
              style={
                this.state[`${key}Error`] ?
                  {border: `1px solid red`, width: '100%'}
                :
                  {width: '100%'}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set(key, event, '')}
            >
              <React.Fragment>
                {this.state[`${choices}`].map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
                }
              </React.Fragment>
          </Select>
          )
                
        default:

      }
    }
    
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>GENERATE REPORT</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.type}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='proofpoint'/>

          <Divider/>

          { (this.props.asset && this.props.asset.id) ?
            <React.Fragment>
              {this.state.loading ?
                <Spin indicator={spinIcon25} style={{margin: 'auto 48%'}}/> 
              :
               <React.Fragment>
                <br/>
                <Row>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Report Type:</p>
                  </Col>
                    <Col span={6}>
                      {createElement('select', 'reportType', 'reportTypes', '', '')}
                    </Col>
                </Row>

                { this.state.reportType && this.state.reportType === "report-phishing" ?
                  <React.Fragment>
                    <Row>
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>mailFrom:</p>
                      </Col>
                      <Col span={6}>
                        {createElement('input', 'mailFrom', '', '', '')}
                      </Col>
                    </Row>

                    <Row>
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>upload:</p>
                      </Col>
                      <Col span={6}>
                        {createElement('upload', 'upload', '', '', '')}
                      </Col>
                    </Row>
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Report:</p>
                  </Col>
                  <Col span={6}>
                    {this.state.reportsLoading ?
                      <Spin indicator={spinIcon25} style={{margin: '0 50px', display: 'inline'}}/>
                    :
                      <React.Fragment>
                        {createElement('select', 'report', 'reports', '', '')}
                      </React.Fragment>
                    }
                  </Col>
                </Row>

                <br/>
                <Row>
                  <Col offset={3} span={3}>
                    {createElement('button', '', '', '', 'commit')}
                  </Col>
                </Row>

                <br/>

                <Divider/>

                {this.state.reportLoading ?
                  <Spin indicator={spinIcon50} style={{margin: '49% 49%', display: 'inline'}}/>
                :
                  null
                }

              </React.Fragment>
              }
             </React.Fragment>
          :
            <Alert message="Asset not set" type="error" />
          }
        </Modal>

        {errors()}

      </React.Fragment>
    )
  }

}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.proofpoint.asset,
  assetToken: state.proofpoint.assetToken,  
}))(RemoveHost);