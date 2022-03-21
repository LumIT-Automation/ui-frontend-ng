import React from 'react'
import { connect } from 'react-redux'
import { VictoryChart, VictoryBar, Bar } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  attivazioneAnnos,
  attivazioneAnnosLoading,
  attivazioneAnnosError,

  attivazioneAnno,
  attivazioneAnnoError,

  valueError
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
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
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.attivazioneAnnosError) {
      if (!this.props.attivazioneAnnos || prevProps.attivazioneAnnos !== this.props.attivazioneAnnos)   {
        this.attivazioneAnnosGet()
      }
    }
  }

  componentWillUnmount() {
  }

  fake = [
    {
        "ATTIVAZIONE_ANNO": new Date(2012, 1, 1),
        "COUNT": 1
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2013, 1, 1),
        "COUNT": 3
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2014, 1, 1),
        "COUNT": 2
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2015, 1, 1),
        "COUNT": 45
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2016, 1, 1),
        "COUNT": 239
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2017, 1, 1),
        "COUNT": 288
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2018, 1, 1),
        "COUNT": 543
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2019, 1, 1),
        "COUNT": 540
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2020, 1, 1),
        "COUNT": 689
    },
    {
        "ATTIVAZIONE_ANNO": new Date(2021, 1, 1),
        "COUNT": 596
    }
  ]

  attivazioneAnnosGet = async () => {
    this.props.dispatch(attivazioneAnnosLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        //this.props.dispatch(attivazioneAnnos(resp.data.items))
        this.props.dispatch(attivazioneAnnos(this.fake))
      },
      error => {
        this.props.dispatch(attivazioneAnnosError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=ATTIVAZIONE_ANNO`, this.props.token)
    this.props.dispatch(attivazioneAnnosLoading(false))
  }

  fetchValue = async () => {
    this.setState({valueLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=ATTIVAZIONE_ANNO&fval=${this.state.value}`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    const handleOnClick = (e, d, c) => {
      console.log(e)
      console.log(d)
      console.log(c)
      //this.setState({visible: true, value: n.datum.FIRMWARE}, () => this.fetchValue())
    };

    const handleMouseOver = () => {
      const fillColor = this.state.clicked ? "blue" : "tomato";
      const clicked = !this.state.clicked;
      this.setState({
        style: {
          data: { fill: fillColor }
        }
      });
    };

    const handleMouseLeave = () => {
      const fillColor = this.state.clicked ? "blue" : "tomato";
      const clicked = !this.state.clicked;
      this.setState({
        clicked,
        style: {
          data: { fill: fillColor }
        }
      });
    };

    return (
      <React.Fragment>
        { this.props.attivazioneAnnosLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Attivazione Anno: {this.state.name}</p>
            </Row>
            <Row>
              <VictoryChart
                scale={{ x: "time" }}
              >
                <VictoryBar
                  dataComponent={
                    <Bar events={{
                      onMouseOver: handleMouseOver,
                      onMouseLeave: handleMouseLeave,
                      onClick: handleOnClick,
                    }}/>
                  }
                  style={this.state.style}
                  data={this.props.attivazioneAnnos}
                  x="ATTIVAZIONE_ANNO"
                  y="COUNT"
                />
              </VictoryChart>
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
                      { this.props.attivazioneAnnos ?
                        <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                      :
                        null
                      }
                    </React.Fragment>
                  }
                </Modal>

                { this.props.valueError ? <Error component={'ATTIVAZIONE_ANNO'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }

              </React.Fragment>
            :
              null
            }

            { this.props.attivazioneAnnosError ? <Error component={'ATTIVAZIONE_ANNO'} error={[this.props.attivazioneAnnosError]} visible={true} type={'attivazioneAnnosError'} /> : null }

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

  attivazioneAnno: state.fortinetdb.attivazioneAnno,
  attivazioneAnnoError: state.fortinetdb.attivazioneAnnoError,

  valueError: state.fortinetdb.valueError,
}))(AttivazioneAnno);
