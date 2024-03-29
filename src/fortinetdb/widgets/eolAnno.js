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

import {
  eolAnnos,
  eolAnnosLoading,
  eolAnno,

  eolMeses,
  eolMesesLoading,
} from '../store'

import { Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class EolAnno extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      style: {
        data: { fill: "tomato" }
      }
    };
  }

  componentDidMount() {

    this.eolAnnosGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }

  eolAnnosGet = async () => {
    this.props.dispatch(eolAnnosLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        delete resp.data.items[0]
        resp.data.items.forEach((item, i) => {
          item.EOL_ANNO = item.EOL_ANNO.toString()
        });
        this.props.dispatch(eolAnnos(resp.data.items ))
      },
      error => {
        error = Object.assign(error, {
          component: 'eolAnno',
          vendor: 'fortinetdb',
          errorType: 'eolAnnosError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=EOL_ANNO`, this.props.token)
    this.props.dispatch(eolAnnosLoading(false))
  }

  eolMesesGet = async anno => {
    this.props.dispatch(eolMesesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(eolMeses(resp.data.items))
      },
      error => {
        error = Object.assign(error, {
          component: 'eolAnno',
          vendor: 'fortinetdb',
          errorType: 'eolMesesError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=EOL_ANNO&fval=${anno}&fieldValues=EOL_MESE`, this.props.token)
    this.props.dispatch(eolMesesLoading(false))
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'eolAnno') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        { this.props.eolAnnosLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={12}>
                <p>Anno: {this.state.eolAnno}</p>
              </Col>
              <Col span={12}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>
            <Row>
              <VictoryChart
                domainPadding={20}
                scale={{ x: "EOL_ANNO" }}
              >
                <VictoryBar
                  style={this.state.style}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: (event, data) => {
                        this.props.dispatch(eolAnno(this.state.eolAnno))
                        this.eolMesesGet(data.datum.EOL_ANNO)
                      },
                      onMouseOver: (event, data) => {
                        this.setState({
                          eolAnno: data.datum.EOL_ANNO,
                          count: data.datum.COUNT });
                      },
                      onMouseLeave: (event, data) => {
                        this.setState({
                          eolAnno: null,
                          count: null });
                      }
                    }
                  }]}
                  data={this.props.eolAnnos}
                  x={'EOL_ANNO'}
                  y={'COUNT'}
                />
              </VictoryChart>
            </Row>

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

  eolAnnos: state.fortinetdb.eolAnnos,
  eolAnnosLoading: state.fortinetdb.eolAnnosLoading,

  eolMeses: state.fortinetdb.eolMeses,
  eolMesesLoading: state.fortinetdb.eolMesesLoading,
}))(EolAnno);
