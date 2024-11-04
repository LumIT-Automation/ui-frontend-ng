import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store'

import {
  assets,
} from '../store'

import IpComponent from './ipComponent'
import RequestIp from './requestIp'
import ReleaseIp from './releaseIp'
import CloudNetwork from './cloudNetwork'

import { Row, Col } from 'antd';



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'infoblox', 'assets_get')) {
      if (!this.props.error) {
        if (!this.props.assets) {
          this.assetsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(assets( resp ))
      },
      error => {
        error = Object.assign(error, {
          component: 'serviceManager',
          vendor: 'infoblox',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'serviceManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment >
        <Row>
          <Col span={4} offset={2} >
            <IpComponent service='ip details'/>
          </Col>

          <Col span={4} offset={2}>
            <RequestIp/>
          </Col>

          <Col span={4} offset={2} >
            <IpComponent service='ip modify'/>
          </Col>

          <Col span={4} offset={2}>
            <ReleaseIp/>
          </Col>
        </Row>

        <br/>

        <Row>
          <Col span={4} offset={2}>
            <CloudNetwork vendor='infoblox' service='cloud network'/>
          </Col>
        </Row>

        {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  assets: state.infoblox.assets,
}))(Manager);
