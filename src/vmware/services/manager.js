import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  assets,
} from '../store'

import VmCreate from './vmCreate'
import { Row, Col } from 'antd'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
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
          component: 'servicesManager',
          vendor: 'vmware',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR("vmware/assets/", this.props.token)
  }



  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'servicesManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <Row>
          <Col span={4} offset={2} >
            <VmCreate/>
          </Col>
        </Row>

        {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.vmware,
  error: state.concerto.err,

  assets: state.vmware.assets,
}))(Manager);
