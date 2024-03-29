import React from 'react'
import { connect } from 'react-redux'
import { VictoryChart, VictoryBar } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class EolMese extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      style: {
        data: { fill: "orange" }
      }
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }

  fetchValue = async () => {
    await this.setState({
      valueLoading: true,
      visible: true,
    })
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items })
      },
      error => {
        error = Object.assign(error, {
          component: 'eolMese',
          vendor: 'fortinetdb',
          errorType: 'valueError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=EOL_ANNO&fval=${this.props.eolAnno}&fby=EOL_MESE&fval=${this.state.value}`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'eolMese') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        { this.props.eolMesesLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={8}>
                <p>Anno: {this.props.eolAnno}</p>
              </Col>
              <Col span={8}>
                <p>Mese: {this.state.eolMese}</p>
              </Col>
              <Col span={8}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>
            <Row>
              <VictoryChart
                domainPadding={20}
                scale={{ x: "EOL_MESE" }}
              >
                {this.props.eolMeses ?
                  <VictoryBar
                    style={this.state.style}
                    events={[{
                      target: "data",
                      eventHandlers: {
                        onClick: (event, data) => {
                          this.setState({
                            value: data.datum.EOL_MESE,
                            count: data.datum.COUNT
                          }, () => this.fetchValue());

                        },
                        onMouseOver: (event, data) => {
                          this.setState({
                            eolMese: data.datum.EOL_MESE,
                            count: data.datum.COUNT
                          });
                        },
                        onMouseLeave: (event, data) => {
                          this.setState({
                            eolMese: null,
                            count: null
                          });
                        }
                      }
                    }]}
                    data={this.props.eolMeses}
                    x={'EOL_MESE'}
                    y={'COUNT'}
                  />
                :
                  null
                }

              </VictoryChart>
            </Row>

            { this.state.visible ?
              <React.Fragment>
                <Modal
                  title={<p style={{textAlign: 'center'}}>{this.props.eolAnno} - {this.state.value}</p>}
                  centered
                  destroyOnClose={true}
                  visible={this.state.visible}
                  footer={''}
                  //onOk={() => this.setState({visible: true})}
                  onCancel={this.hide}
                  width={1500}
                  maskClosable={false}
                >
                  { this.state.valueLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                  :
                    <React.Fragment>
                      { this.props.eolMeses ?
                        <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                      :
                        null
                      }
                    </React.Fragment>
                  }
                </Modal>

              </React.Fragment>
            :
              null
            }

          </React.Fragment>
        }

        {errors()}

      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.fortinetdb,
  error: state.concerto.err,

  eolAnno: state.fortinetdb.eolAnno,

  eolMeses: state.fortinetdb.eolMeses,
  eolMesesLoading: state.fortinetdb.eolMesesLoading,

  eolMese: state.fortinetdb.eolMese,
}))(EolMese);
