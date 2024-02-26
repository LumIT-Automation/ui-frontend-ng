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
  networksLoading,
  networks,
  networksFetch,
} from '../store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      moun: false
    };
  }

  componentDidMount() {
    this.setState({moun: true})
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.domain && !prevProps.error && !this.props.error) {
      if (!this.props.networks) {
        this.networksGet()
      }
      else if (this.props.networksFetch) {
        this.networksGet()
        this.props.dispatch(networksFetch(false))
      }
      else if ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) {
        this.networksGet()
      }
      else {
      }
    }
  }

  componentWillUnmount() {
    this.setState({moun: false})
  }


  networksGet = async () => {
    this.props.dispatch(networksLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(networks(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'networks',
          vendor: 'checkpoint',
          errorType: 'networksError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/networks/?local`, this.props.token)
    this.props.dispatch(networksLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'networks') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.networks_post || this.props.authorizations.any) ?
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

  networks: state.checkpoint.networks,
  networksFetch: state.checkpoint.networksFetch,
}))(Manager);
