import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  application_sitesLoading,
  application_sites,
  application_sitesFetch,
  application_sitesError
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
    if (this.props.asset && this.props.domain) {
      if (!this.props.application_sitesError) {
        this.props.dispatch(application_sitesFetch(false))
        if (!this.props.application_sites) {
          this.application_sitesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.application_sitesError) ) {
      if (!this.props.application_sites) {
        this.application_sitesGet()
      }
      if (this.props.application_sitesFetch) {
        this.application_sitesGet()
        this.props.dispatch(application_sitesFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.application_sitesGet()
      }
    }
  }

  componentWillUnmount() {
  }


  application_sitesGet = async () => {
    this.props.dispatch(application_sitesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(application_sites(resp))
      },
      error => {
        this.props.dispatch(application_sitesError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/application-sites/?custom&local`, this.props.token)
    this.props.dispatch(application_sitesLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.application_sites_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Domain not set" type="error" />
        }

        <React.Fragment>
          { this.props.application_sitesError ? <Error component={'application_site manager'} error={[this.props.application_sitesError]} visible={true} type={'application_sitesError'} /> : null }
        </React.Fragment>
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  application_sites: state.checkpoint.application_sites,
  application_sitesFetch: state.checkpoint.application_sitesFetch,
  application_sitesError: state.checkpoint.application_sitesError
}))(Manager);
