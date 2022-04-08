import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../error'

import {
  backupStatuss,
  backupStatussLoading,
  backupStatussError,
  backupStatus,
  backupStatusError,
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
    if (!this.props.modelloError) {
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
        this.props.dispatch(backupStatuss(resp.data.items))
      },
      error => {
        this.props.dispatch(backupStatussError(error))
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
        this.props.dispatch(backupStatusError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=BACKUP_STATUS&fval=${this.state.backupStatus}&fby=MODELLO&fval=${this.props.modello}`, this.props.token)
    this.setState({backupStatusLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

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

                { this.props.backupStatussError ? <Error component={'BACKUP_STATUS'} error={[this.props.backupStatussError]} visible={true} type={'backupStatussError'} /> : null }
                { this.props.backupStatusError ? <Error component={'BACKUP_STATUS'} error={[this.props.backupStatusError]} visible={true} type={'backupStatusError'} /> : null }

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

  categoria: state.fortinetdb.categoria,
  vendor: state.fortinetdb.vendor,
  modello: state.fortinetdb.modello,

  backupStatuss: state.fortinetdb.backupStatuss,
  backupStatussLoading: state.fortinetdb.backupStatussLoading,
  backupStatussError: state.fortinetdb.backupStatussError,

  backupStatus: state.fortinetdb.backupStatus,
  backupStatusError: state.fortinetdb.backupStatusError,
}))(BackupStatus);
