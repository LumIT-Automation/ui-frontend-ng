import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../error'

import {
  fieldError,
  valueError
} from '../store'

import List from '../projects/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Segmento extends React.Component {

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
    await rest.doXHR(`fortinetdb/projects/?fieldValues=SEGMENTO`, this.props.token)
    this.setState({fieldLoading: false})
  }

  fetchValue = async () => {
    this.setState({valueLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({projects: resp.data.items})
      },
      error => {
        this.props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fby=SEGMENTO&fval=${this.state.value}`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <React.Fragment>
        { this.state.fieldLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={19}>
                <p>Segmento: {this.state.name}</p>
              </Col>
              <Col span={5}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>
            <Row>
              <svg viewBox="0 0 300 300">
                <VictoryPie
                  colorScale={ColorScale}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: (e, n) => {
                        this.setState({visible: true, value: n.datum.SEGMENTO}, () => this.fetchValue())
                      },
                      onMouseOver: (e, n) => {
                        this.setState({name: n.datum.SEGMENTO, color: n.style.fill, count: n.datum.COUNT})
                      },
                      onMouseLeave: (e, n) => {
                        this.setState({name: '', color: '', count: ''})
                      }
                    }
                  }]}
                  standalone={false}
                  width={300} height={300}
                  data={this.state.field}
                  x="Segmento"
                  y="COUNT"
                  innerRadius={50} radius={80}
                  labels={({ datum }) => null}
                />
              </svg>
            </Row>

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
                      <List height={550} pagination={5} filteredProjects={this.state.projects}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>
              { this.props.fieldError ? <Error component={'Segmento'} error={[this.props.fieldError]} visible={true} type={'fieldError'} /> : null }
              { this.props.valueError ? <Error component={'Segmento'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }
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
}))(Segmento);
