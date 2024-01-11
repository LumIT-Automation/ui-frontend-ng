import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Select, Button, Divider, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  err,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'


const spinIcon25 = <LoadingOutlined style={{ fontSize: 25 }} spin />
const spinIcon50 = <LoadingOutlined style={{ fontSize: 50 }} spin />


class RemoveHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      reportTypes: ["report-knowledge-assessment"],
      reports: [],
    };
  }

  componentDidMount() {
    //this.checkedTheOnlyAsset()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state.reportType)
    console.log(this.state.report)
    if (this.state.reportType != prevState.reportType) {
      this.main()
    } 
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
  }

  main = async() => {
    if (this.props.vendor && this.props.asset) {
      this.setState({reportsLoading: true})
      let data = await this.dataGet('report-knowledge-assessment')
      console.log(data)
      if (data.status && data.status !== 200 ) {
        this.props.dispatch(err(data))
        await this.setState({reportsLoading: false})
        return
      }
      else {
        await this.setState({reportsLoading: false, reports: data.data.items})
      }
      console.log(this.state.reports)
    }
    
  }

  set = async (key, value) => {
    if (key === 'reportType') {
      await this.setState({reportType: value, reportTypeError: false})
    }
    if (key === 'report') {
      await this.setState({report: value, reportError: false})
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

    if (!this.state.reportType) {
      ++errors
      await this.setState({reportTypeError: true})
    }
    if (!this.state.report) {
      ++errors
      await this.setState({reportError: true})
    }
    return errors
  }

  getReport = async () => {
    this.setState({reportLoading: true})
    let data = await this.dataGet('report')
    if (data.status && data.status !== 200 ) {
      this.props.dispatch(err(data))
      await this.setState({reportLoading: false})
      return
    }
    else {
      await this.setState({reportLoading: false})
      data.blob().then((blob) => {
          // Creating new object of PDF file
          const fileURL = window.URL.createObjectURL(blob)
                
          // Setting various property values
          let link = document.createElement("a")
          link.title = this.state.report
          link.href = fileURL
          link.target = "_blank"
          link.click()

          //alink.download = data;
          //alink.setAttribute('download', this.state.report);
          //alink.click();
      });
    }
  }

  dataGet = async (resource) => {
    let endpoint 
    let r

    if (resource == 'report-knowledge-assessment') {
      endpoint = `${this.props.vendor}/${this.props.asset.id}/usecases/${resource}/`
    }
    if (resource == 'report') {
      endpoint = `${this.props.vendor}/${this.props.asset.id}/usecases/${this.state.reportType}/${this.state.report}/`
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
    await rest.doXHR(endpoint, this.props.token )
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

    let randomKey = () => {
      return Math.random().toString()
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
        break;   

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
        break;          

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
                <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> 
              :
               <React.Fragment>
                <br/>
                <Row>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Report Type:</p>
                  </Col>
                  <Col span={5}>
                    {createElement('select', 'reportType', 'reportTypes', '', '')}
                  </Col>
                </Row>

                <Row>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Report:</p>
                  </Col>
                  <Col span={5}>
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

        { this.props.err ? <Error component={'services manager proofpoint'} error={[this.props.err]} visible={true} type={'err'} /> : null }

      </React.Fragment>
    )
  }

}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  asset: state.proofpoint.asset,
  err: state.proofpoint.err,
  
}))(RemoveHost);