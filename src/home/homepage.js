import React from 'react'
import { connect } from 'react-redux'

import 'antd/dist/antd.css';
import '../App.css'

import { Statistic, Row, Col, Layout, Divider } from 'antd'

import Histogram from './histogram'



class Homepage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
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


  render() {
    return (
      <React.Fragment>

        <Row className="row-homepage" between="xs" style={{backgroundColor: '#FFFFFF',  margin: 10}}>

          <Col offset={1} span={6} className="col-homepage" style={{textAlign: 'center'}}>
            <Statistic
              title="Total Firewalls"
              value={3600}
              valueStyle={{ color: '#000000' }}
              style={{backgroundColor: '#FFFFFF',  margin: 10}}
            />
          </Col>

          <Col span={1} className="col-homepage" style={{textAlign: 'center'}}>
            <Divider type='vertical' style={{height: '100%'}}/>
          </Col>

          <Col offset={1} span={6} className="col-homepage" style={{textAlign: 'center'}}>
          <Statistic
            title="New Firewalls (2021)"
            value={500}
            valueStyle={{ color: '#000000' }}
            style={{backgroundColor: '#FFFFFF',  margin: 10}}
          />
          </Col>

          <Col span={1} className="col-homepage" style={{textAlign: 'center'}}>
            <Divider type='vertical' style={{height: '100%'}}/>
          </Col>

          <Col offset={1} span={6} className="col-homepage" style={{textAlign: 'center'}}>
            <Statistic
              title="New Firewalls (January)"
              value={50}
              valueStyle={{ color: '#000000' }}
              style={{backgroundColor: '#FFFFFF',  margin: 10}}
            />
          </Col>
          <Row gutter={16} between="xs" style={{marginTop: '5vh'}}>
            <Col offset={2} span={16} style={{textAlign: 'center'}}>
              <Histogram/>
            </Col>
          </Row>
        </Row>

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
}))(Homepage);
