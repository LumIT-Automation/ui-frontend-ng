import React from 'react'
import { connect } from 'react-redux'
import { VictoryChart, VictoryBar } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  attivazioneAnnos,
  attivazioneAnnosLoading,
  attivazioneAnnosError,
  attivazioneAnno,

  attivazioneMeses,
  attivazioneMesesLoading,
  attivazioneMesesError,

} from '../store'

import { Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class AttivazioneAnno extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      style: {
        data: { fill: "blue" }
      }
    };
  }

  componentDidMount() {

    this.attivazioneAnnosGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }

  attivazioneAnnosGet = async () => {
    this.props.dispatch(attivazioneAnnosLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        delete resp.data.items[0]
        resp.data.items.forEach((item, i) => {
          item.ATTIVAZIONE_ANNO = item.ATTIVAZIONE_ANNO.toString()
        });
        this.props.dispatch(attivazioneAnnos(resp.data.items ))
      },
      error => {
        this.props.dispatch(attivazioneAnnosError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=ATTIVAZIONE_ANNO`, this.props.token)
    this.props.dispatch(attivazioneAnnosLoading(false))
  }

  attivazioneMesesGet = async anno => {
    this.props.dispatch(attivazioneMesesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(attivazioneMeses(resp.data.items))
      },
      error => {
        this.props.dispatch(attivazioneMesesError(error ))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=ATTIVAZIONE_ANNO&fval=${anno}&fieldValues=ATTIVAZIONE_MESE`, this.props.token)
    this.props.dispatch(attivazioneMesesLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <React.Fragment>
        { this.props.attivazioneAnnosLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={12}>
                <p>Anno: {this.state.attivazioneAnno}</p>
              </Col>
              <Col span={12}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>
            <Row>
              <VictoryChart
                domainPadding={20}
              >
                <VictoryBar
                  style={this.state.style}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: (event, data) => {
                        this.props.dispatch(attivazioneAnno(this.state.attivazioneAnno))
                        this.attivazioneMesesGet(data.datum.ATTIVAZIONE_ANNO)
                      },
                      onMouseOver: (event, data) => {
                        this.setState({
                          attivazioneAnno: data.datum.ATTIVAZIONE_ANNO,
                          count: data.datum.COUNT });
                      },
                      onMouseLeave: (event, data) => {
                        this.setState({
                          attivazioneAnno: null,
                          count: null });
                      }
                    }
                  }]}
                  data={this.props.attivazioneAnnos}
                  x={'ATTIVAZIONE_ANNO'}
                  y={'COUNT'}
                />
              </VictoryChart>
            </Row>

            { this.props.attivazioneAnnosError ? <Error component={'ATTIVAZIONE_ANNO'} error={[this.props.attivazioneAnnosError]} visible={true} type={'attivazioneAnnosError'} /> : null }
            { this.props.attivazioneMesesError ? <Error component={'ATTIVAZIONE_MESE'} error={[this.props.attivazioneMesesError]} visible={true} type={'attivazioneMesesError'} /> : null }

          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  attivazioneAnnos: state.fortinetdb.attivazioneAnnos,
  attivazioneAnnosLoading: state.fortinetdb.attivazioneAnnosLoading,
  attivazioneAnnosError: state.fortinetdb.attivazioneAnnosError,

  attivazioneMeses: state.fortinetdb.attivazioneMeses,
  attivazioneMesesLoading: state.fortinetdb.attivazioneMesesLoading,
  attivazioneMesesError: state.fortinetdb.attivazioneMesesError,

}))(AttivazioneAnno);
