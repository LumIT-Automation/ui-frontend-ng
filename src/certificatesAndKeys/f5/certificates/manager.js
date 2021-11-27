import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest"
import Error from "../../../error/f5Error"

import {
  setCertificatesLoading,
  setCertificates,
  setCertificatesFetch,
  setCertificatesError
} from '../../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd'



class CertificatesManager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (!this.props.certificatesError) {
      if (this.props.asset) {
        this.props.dispatch(setCertificatesFetch(false))
        if (!this.props.certificates) {
          this.fetchCertificates()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.certificatesFetch) {
      this.fetchCertificates()
      this.props.dispatch(setCertificatesFetch(false))
    }
  }

  componentWillUnmount() {
  }



  fetchCertificates = async () => {
    this.props.dispatch(setCertificatesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setCertificates( resp ))
      },
      error => {
        this.props.dispatch(setCertificatesError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token)
    this.props.dispatch(setCertificatesLoading(false))
  }


  render() {

    return (
      <React.Fragment>
        <br/>
        { (this.props.asset && this.props.asset.id ) ?
          this.props.authorizations && (this.props.authorizations.certificates_post || this.props.authorizations.any) ?
            <React.Fragment>
              <Add/>
              <br/>
              <br/>
            </React.Fragment>
          :
            null
        :
          null
        }

        { (this.props.asset && this.props.asset.id ) ?
            <List/>
            :
            <Alert message="Asset not set" type="error" />
        }

        { this.props.certificatesError ? <Error component={'certificates manager f5'} error={[this.props.certificatesError]} visible={true} type={'setCertificatesError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,

  certificates: state.f5.certificates,
  certificatesFetch: state.f5.certificatesFetch,
  certificatesError:  state.f5.certificatesError
}))(CertificatesManager);
