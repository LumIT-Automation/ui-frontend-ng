import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  models,
  modelsLoading,
  model,
  modelsError,
  modelError,
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class Firmware extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.vendorError) {
      if (this.props.vendor && prevProps.vendor !== this.props.vendor) {
        this.props.dispatch(models([]))
        this.props.dispatch(model())
        this.modelsGet()
      }
    }
  }

  componentWillUnmount() {
  }

  modelsGet = async () => {
    this.props.dispatch(modelsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(models(resp.data.items))
      },
      error => {
        this.props.dispatch(modelsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=VENDOR&fval=${this.props.vendor}&fieldValues=MODELLO`, this.props.token)
    this.props.dispatch(modelsLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    console.log(this.props.model)
    return (
      <Row>
        <Col offset={2} span={6}>
          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Model:</p>
        </Col>
        <Col span={16}>
          { this.state.modelsLoading ?
            <Spin indicator={spinIcon} />
          :
            <React.Fragment>
              { this.props.vendor ?
                <Select
                  showSearch
                  value={this.props.model}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  key={null}
                  style={{ width: '300px' }}
                  onChange={e => this.props.dispatch(model(e))}>
                  {this.props.models && this.props.models.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n.MODELLO}>{n.MODELLO}</Select.Option>
                    )})
                  }
                </Select>
                :
                <Select style={{ width: '300px' }} disabled/>
              }
            </React.Fragment>
          }
        </Col>

        { this.state.visible ?
            <React.Fragment>
              <Modal
                title={<p style={{textAlign: 'center'}}>{this.state.value}</p>}
                centered
                destroyOnClose={true}
                visible={this.state.visible}
                footer={''}
                //onOk={() => this.setState({visible: true})}
                onCancel={this.hide}
                width={1500}
              >
                { this.state.valueLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                  <React.Fragment>
                    { this.state.models ?
                      <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>

              { this.props.modelsError ? <Error component={'model'} error={[this.props.modelsError]} visible={true} type={'modelsError'} /> : null }

            </React.Fragment>
          :
            null
          }

      </Row>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  vendor: state.fortinetdb.vendor,

  models: state.fortinetdb.models,
  modelsLoading: state.fortinetdb.modelsLoading,
  modelsError: state.fortinetdb.modelsError,

}))(Firmware);
