import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  categorias,
  categoriasLoading,
  categoriasError,
  categoria,
  categoriaError,

  vendors,
  vendorsLoading,
  vendor,
  vendorsError,
  vendorError,
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col, Select, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class Selector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.categoriasGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.categoria && prevProps.categoria !== this.props.categoria) {
      this.vendorsGet()
    }
  }

  componentWillUnmount() {
  }

  categoriasGet = async () => {
    this.props.dispatch(categoriasLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(categorias(resp))
      },
      error => {
        this.props.dispatch(categoriasError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=CATEGORIA`, this.props.token)
    this.props.dispatch(categoriasLoading(false))
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
    await rest.doXHR(`fortinetdb/devices/?fby=CATEGORIA&fval=${this.props.categoria}&fieldValues=VENDOR`, this.props.token)
    this.props.dispatch(vendorsLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <Row style={{paddingLeft: '100px'}}>
        <Col>
          Categoria:
          { this.props.categoriasLoading ?
            <Spin indicator={spinIcon} />
          :
            <Select
              showSearch
              value={this.props.categoria}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              key={null}
              style={{ width: 300, marginLeft: '10px' }}
              onChange={e => this.props.dispatch(categoria(e))}>
              {this.props.categorias && this.props.categorias.map((n, i) => {
                return (
                  <Select.Option key={i} value={n.CATEGORIA}>{n.CATEGORIA}</Select.Option>
                )})
              }
            </Select>
          }
        </Col>

        <Col offset={1}>
          { this.props.vendorsLoading ?
            <React.Fragment>
              Vendor:  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
            </React.Fragment>
            :
            <React.Fragment>
            Vendor:
            {this.props.categoria ?
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onChange={e => this.props.dispatch(vendor(e))}
                style={{ width: 200, marginLeft: '10px' }}
              >
                 {this.props.vendors &&  this.props.vendors.map((p, i) => {
                return (
                  <Select.Option key={i} value={p.VENDOR}>{p.VENDOR}</Select.Option>
                )
              })}
              </Select>
              :
              <Select disabled value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
              </Select>
            }
            </React.Fragment>
          }
        </Col>

        <Col>
          Modelllo:
          { this.props.categoriasLoading ?
            <Spin indicator={spinIcon} />
          :
            <Select
              showSearch
              value={this.props.categoria}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              key={null}
              style={{ width: 300, marginLeft: '10px' }}
              onChange={e => this.props.dispatch(categoria(e))}>
              {this.props.categorias && this.props.categorias.map((n, i) => {
                return (
                  <Select.Option key={i} value={n.CATEGORIA}>{n.CATEGORIA}</Select.Option>
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

              { this.props.categoriasError ? <Error component={'CATEGORIA'} error={[this.props.categoriasError]} visible={true} type={'categoriasError'} /> : null }
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

  categorias: state.fortinetdb.categorias,
  categoriasLoading: state.fortinetdb.categoriasLoading,
  categoriasError: state.fortinetdb.categoriasError,

  categoria: state.fortinetdb.categoria,
  categoriaError: state.fortinetdb.categoriaError,

  vendors: state.fortinetdb.vendors,
  vendorsLoading: state.fortinetdb.vendorsLoading,
  vendorsError: state.fortinetdb.vendorsError,

  vendor: state.fortinetdb.vendor,
  vendorError: state.fortinetdb.vendorError,
}))(Selector);
