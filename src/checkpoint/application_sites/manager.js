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
  application_sitesLoading,
  application_sites,
  application_sitesFetch,
  application_site_categorysLoading,
  application_site_categorys,
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
      if (!this.props.error) {
        this.props.dispatch(application_sitesFetch(false))
        if (!this.props.application_sites) {
          this.application_sitesGet()
          this.application_site_categorysGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.error) ) {
      if (!this.props.application_sites) {
        this.application_sitesGet()
        this.application_site_categorysGet()
      }
      if (this.props.application_sitesFetch) {
        this.application_sitesGet()
        this.application_site_categorysGet()
        this.props.dispatch(application_sitesFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.application_sitesGet()
        this.application_site_categorysGet()
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
        this.props.dispatch(application_sites(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'application_sites',
          vendor: 'checkpoint',
          errorType: 'application_sitesError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/application-sites/?custom&local`, this.props.token)
    this.props.dispatch(application_sitesLoading(false))
  }

  application_site_categorysGet = async () => {
    this.props.dispatch(application_site_categorysLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(application_site_categorys(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'application_sites',
          vendor: 'checkpoint',
          errorType: 'application_site_categorysError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/application-site-categories/`, this.props.token)
    this.props.dispatch(application_site_categorysLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'application_sites') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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

  application_sites: state.checkpoint.application_sites,
  application_sitesFetch: state.checkpoint.application_sitesFetch,
  application_site_categorys: state.checkpoint.application_site_categorys,
}))(Manager);
