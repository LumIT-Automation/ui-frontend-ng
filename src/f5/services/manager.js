import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import {Divider } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store'

import {
  assets,
} from '../store'

import CreateVs from './createVs'
import F5ObjectDelete from './deleteObject'
import UpdateCert from './updateCert'
import PoolMaintenance from './poolMaintenance/manager'
import { Row, Col } from 'antd'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'assets_get')) {
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
          component: 'f5ServiceManager',
          vendor: 'f5',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR("f5/assets/?includeDr", this.props.token)
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
      if (this.props.error && this.props.error.component === 'f5ServiceManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <Row>
          <Col span={4} offset={2} >
            <CreateVs vendor='f5' type='L7'/>
          </Col>

          <Col span={4} offset={2} >
            <CreateVs vendor='f5' type='L4'/>
          </Col>

          <Col span={4} offset={2} >
            <UpdateCert vendor='f5'/>
          </Col>
        </Row>

        <br/>

        <Row>
          <Col span={4} offset={2}>
            <PoolMaintenance/>
          </Col>
        </Row>

        <br/>
        
        <Row>
          <Col span={4} offset={2}>
            <F5ObjectDelete vendor='f5' f5object='virtualserver'/>
          </Col>

          <Col span={4} offset={2}>
            <F5ObjectDelete vendor='f5' f5object='node'/>
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

  assets: state.f5.assets,
}))(Manager);
