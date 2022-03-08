import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../../error/fortinetdbError'

import {
  fieldError,
  valueError
} from '../../_store/store.fortinetdb'

import List from '../devices/list'

import { Modal, Spin, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Firmware extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.fetchField()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  fetchField = async () => {
    this.setState({fieldLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({field: resp.data.items})
      },
      error => {
        this.props.dispatch(fieldError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=FIRMWARE`, this.props.token)
    this.setState({fieldLoading: false})
  }

  fetchValue = async e => {
    this.setState({valueLoading: true, visible: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=FIRMWARE&fval=${e}`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    console.log(typeof(this.state.field))
    return (
      <React.Fragment>
        { this.state.fieldLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
          <Select
            showSearch
            defaultValue={null}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            key={null}
            style={{ width: '200px' }}
            onChange={e => this.fetchValue(e)}>
            {this.state.field && this.state.field.map((n, i) => {
              return (
                <Select.Option key={i} value={n.FIRMWARE}>{n.FIRMWARE}</Select.Option>
              )})
            }
          </Select>

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
                    { this.state.field ?
                      <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>
              { this.props.fieldError ? <Error component={'FIRMWARE'} error={[this.props.fieldError]} visible={true} type={'fieldError'} /> : null }
              { this.props.valueError ? <Error component={'FIRMWARE'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }
            </React.Fragment>
          :
            null
          }

          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  fieldError: state.fortinetdb.fieldError,
  valueError: state.fortinetdb.valueError,
}))(Firmware);
