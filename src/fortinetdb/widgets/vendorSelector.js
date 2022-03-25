import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  vendors,
  vendorsLoading,
  vendor,
  vendorsError,
  vendorError,
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
    this.vendorsGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  vendorsGet = async () => {
    this.props.dispatch(vendorsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(vendors(resp))
      },
      error => {
        this.props.dispatch(vendorError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=VENDOR`, this.props.token)
    this.props.dispatch(vendorsLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <Row>
        <Col offset={2} span={6}>
          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Vendor:</p>
        </Col>
        <Col span={16}>
          { this.state.vendorsLoading ?
            <Spin indicator={spinIcon} />
          :
            <Select
              showSearch
              value={this.props.vendor}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              key={null}
              style={{ width: '300px' }}
              onChange={e => this.props.dispatch(vendor(e))}>
              {this.props.vendors && this.props.vendors.map((n, i) => {
                return (
                  <Select.Option key={i} value={n.VENDOR}>{n.VENDOR}</Select.Option>
                )})
              }
            </Select>
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
                    { this.state.vendors ?
                      <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>
              { this.props.vendorsError ? <Error component={'VENDOR'} error={[this.props.vendorsError]} visible={true} type={'vendorsError'} /> : null }
              { this.props.vendorError ? <Error component={'VENDOR'} error={[this.props.vendorError]} visible={true} type={'vendorError'} /> : null }
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

  vendors: state.fortinetdb.vendors,
  vendorsLoading: state.fortinetdb.vendorsLoading,
  vendorsError: state.fortinetdb.vendorsError,

  vendor: state.fortinetdb.vendor,
  vendorError: state.fortinetdb.vendorError,
}))(Firmware);
