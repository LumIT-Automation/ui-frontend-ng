import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  categorias,
  categoriasLoading,
  categoria,

  vendors,
  vendorsLoading,
  vendor,

  modellos,
  modellosLoading,
  modello,
} from '../store'

import { Spin, Row, Col, Select } from 'antd'
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
    if (this.props.vendor && prevProps.vendor !== this.props.vendor) {
      this.modellosGet()
    }
  }

  componentWillUnmount() {
  }

  categoriasGet = async () => {
    this.props.dispatch(categoriasLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(categorias(resp.data.items))
      },
      error => {
        error = Object.assign(error, {
          component: 'selector',
          vendor: 'fortinetdb',
          errorType: 'categoriasError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=CATEGORIA`, this.props.token)
    this.props.dispatch(categoriasLoading(false))
  }

  vendorsGet = async () => {
    this.props.dispatch(vendors(null))
    this.props.dispatch(vendor(null))
    this.props.dispatch(vendorsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(vendors(resp.data.items))
      },
      error => {
        error = Object.assign(error, {
          component: 'selector',
          vendor: 'fortinetdb',
          errorType: 'vendorsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=CATEGORIA&fval=${this.props.categoria}&fieldValues=VENDOR`, this.props.token)
    this.props.dispatch(vendorsLoading(false))
  }

  modellosGet = async () => {
    this.props.dispatch(modellos(null))
    this.props.dispatch(modello(null))
    this.props.dispatch(modellosLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(modellos(resp.data.items))
      },
      error => {
        error = Object.assign(error, {
          component: 'selector',
          vendor: 'fortinetdb',
          errorType: 'modellosError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=CATEGORIA&fval=${this.props.categoria}&fby=VENDOR&fval=${this.props.vendor}&fieldValues=MODELLO`, this.props.token)
    this.props.dispatch(modellosLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'selector') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <Row>
          <Col offset={1} span={7}>
            { this.props.categoriasLoading ?
              <React.Fragment>
                Categoria: <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              </React.Fragment>
            :
              <React.Fragment>
                Categoria:
                <Select
                  style={{ width: 300, marginLeft: '10px'}}
                  showSearch
                  value={this.props.categoria}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={e => this.props.dispatch(categoria(e))}>
                  {this.props.categorias && this.props.categorias.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n.CATEGORIA}>{n.CATEGORIA}</Select.Option>
                    )})
                  }
                </Select>
              </React.Fragment>
            }
          </Col>

          <Col offset={1} span={7}>
            { this.props.vendorsLoading ?
              <React.Fragment>
                Vendor:  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              </React.Fragment>
              :
              <React.Fragment>
              Vendor:
              {this.props.categoria ?
                <Select
                  style={{ width: 300, marginLeft: '10px', display: 'inline-block'}}
                  showSearch
                  value={this.props.vendor}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={e => this.props.dispatch(vendor(e))}
                >
                  {this.props.vendors &&  this.props.vendors.map((p, i) => {
                  return (
                    <Select.Option key={i} value={p.VENDOR}>{p.VENDOR}</Select.Option>
                  )
                })}
                </Select>
                :
                <Select disabled value={null} onChange={null} style={{ width: 300, marginLeft: '10px', display: 'inline-block'}}>
                </Select>
              }
              </React.Fragment>
            }
          </Col>

          <Col offset={1} span={7}>
            { this.props.modellosLoading ?
              <React.Fragment>
                Modello:  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              </React.Fragment>
              :
              <React.Fragment>
              Modello:
              {this.props.vendor ?
                <Select
                  style={{ width: 300, marginLeft: '10px', display: 'inline-block'}}
                  showSearch
                  value={this.props.modello}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={e => this.props.dispatch(modello(e))}
                >
                  {this.props.modellos &&  this.props.modellos.map((p, i) => {
                  return (
                    <Select.Option key={i} value={p.MODELLO}>{p.MODELLO}</Select.Option>
                  )
                })}
                </Select>
                :
                <Select disabled value={null} onChange={null} style={{ width: 300, marginLeft: '10px', display: 'inline-block'}}>
                </Select>
              }
              </React.Fragment>
            }
          </Col>
        </Row>

        {errors()}

      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.fortinetdb,
  error: state.concerto.err,

  categorias: state.fortinetdb.categorias,
  categoriasLoading: state.fortinetdb.categoriasLoading,
  categoria: state.fortinetdb.categoria,

  vendors: state.fortinetdb.vendors,
  vendorsLoading: state.fortinetdb.vendorsLoading,
  vendor: state.fortinetdb.vendor,

  modellos: state.fortinetdb.modellos,
  modellosLoading: state.fortinetdb.modellosLoading,
  modello: state.fortinetdb.modello,
}))(Selector);
