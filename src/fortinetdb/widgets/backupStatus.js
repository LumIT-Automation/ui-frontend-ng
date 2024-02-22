import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  backupStatuss,
  backupStatussLoading,
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class BackupStatus extends React.Component {

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
    if (this.props.categoria !== prevProps.categoria) {
      this.props.dispatch(backupStatuss(null))
    }
    if (this.props.vendor !== prevProps.vendor) {
      this.props.dispatch(backupStatuss(null))
    }
    if (!this.props.error) {
      if (this.props.modello && prevProps.modello !== this.props.modello) {
        this.backupStatussGet()
      }
    }
  }

  componentWillUnmount() {
  }

  backupStatussGet = async () => {
    this.props.dispatch(backupStatussLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        let f = resp.data.items
        f.sort(function(a, b) {
          return b.COUNT - a.COUNT;
        });
        this.props.dispatch(backupStatuss(f))
      },
      error => {
        error = Object.assign(error, {
          component: 'backupStatus',
          vendor: 'fortinetdb',
          errorType: 'backupStatussError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=MODELLO&fval=${this.props.modello}&fieldValues=BACKUP_STATUS`, this.props.token)
    this.props.dispatch(backupStatussLoading(false))
  }

  backupStatusGet = async () => {
    this.setState({backupStatusLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        error = Object.assign(error, {
          component: 'backupStatus',
          vendor: 'fortinetdb',
          errorType: 'backupStatusError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=BACKUP_STATUS&fval=${this.state.backupStatus}&fby=MODELLO&fval=${this.props.modello}`, this.props.token)
    this.setState({backupStatusLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'backupStatus') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        { this.props.backupStatussLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
            <Col span={19}>
              <p>Backup status: {this.state.name}</p>
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
                        this.setState({visible: true, backupStatus: n.datum.BACKUP_STATUS}, () => this.backupStatusGet())
                      },
                      onMouseOver: (e, n) => {
                        this.setState({name: n.datum.BACKUP_STATUS, color: n.style.fill, count: n.datum.COUNT})
                      },
                      onMouseLeave: (e, n) => {
                        this.setState({name: '', color: '', count: ''})
                      }
                    }
                  }]}
                  standalone={false}
                  width={300} height={300}
                  data={this.props.backupStatuss}
                  x="BACKUP_STATUS"
                  y="COUNT"
                  innerRadius={0} radius={80}
                  labels={({ datum }) => null}
                />
                <VictoryLabel
                  textAnchor="start"
                  x={80}
                  y={280}
                  style={{ fill: this.state.color }}
                />
              </svg>
            </Row>

            { this.state.visible ?
              <React.Fragment>
                <Modal
                  title={<p style={{textAlign: 'center'}}>{this.state.backupStatus}</p>}
                  centered
                  destroyOnClose={true}
                  visible={this.state.visible}
                  footer={''}
                  //onOk={() => this.setState({visible: true})}
                  onCancel={this.hide}
                  width={1500}
                  maskClosable={false}
                >
                  { this.state.backupStatusLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                  :
                    <React.Fragment>
                      { this.props.backupStatuss ?
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

  categoria: state.fortinetdb.categoria,
  vendor: state.fortinetdb.vendor,
  modello: state.fortinetdb.modello,

  backupStatuss: state.fortinetdb.backupStatuss,
  backupStatussLoading: state.fortinetdb.backupStatussLoading,

  backupStatus: state.fortinetdb.backupStatus,
}))(BackupStatus);
