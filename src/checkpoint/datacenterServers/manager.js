import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  datacenterServersLoading,
  datacenterServers,
  datacenterServersFetch,
} from '../store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.setState({moun: true})
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.domain && this.props.datacenterServersFetch) {
      this.datacenterServersGet()
    }
    else if (this.props.asset && this.props.domain && (prevProps.domain !== this.props.domain)) {
      this.datacenterServersGet()
    }
    else if (this.props.asset && this.props.domain && !prevProps.error && !this.props.error) {
      if (!this.props.datacenterServers) {
        this.datacenterServersGet()
      }
    }
    else {}
  }

  componentWillUnmount() {
    this.setState({moun: false})
  }

  datacenterServersGet = async () => {
    this.props.dispatch(datacenterServersFetch(false))
    this.props.dispatch(datacenterServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(datacenterServers(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterServers',
          vendor: 'checkpoint',
          errorType: 'datacenterServersError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-servers/?local`, this.props.token)
    this.props.dispatch(datacenterServersLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'datacenterServers') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.datacenterServers_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Domain not set" type="error" />
        }

        {errors()}

      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  datacenterServers: state.checkpoint.datacenterServers,
  datacenterServersFetch: state.checkpoint.datacenterServersFetch,
}))(Manager);
