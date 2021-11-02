import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest";
import Error from '../../../error'

import { setError } from '../../../_store/store.error'
import { setCertificatesLoading, setCertificates, setCertificatesFetch } from '../../../_store/store.f5'

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
    if (this.props.asset) {
      if (!this.props.certificates) {
        this.fetchCertificates()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset) {
      if (!this.props.certificates) {
        this.fetchCertificates()
      }
      if ( ((prevProps.asset !== this.props.asset) && (this.props.asset !== null)) ) {
        this.fetchCertificates()
      }
      if (this.props.certificatesFetch) {
        this.fetchCertificates()
        this.props.dispatch(setCertificatesFetch(false))
      }
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
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token)
    this.props.dispatch(setCertificatesLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { (this.props.asset && this.props.asset.id ) ?
           this.props.authorizations && (this.props.authorizations.certificates_post || this.props.authorizations.any) ?
              <Add/>
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

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  certificates: state.f5.certificates,
  certificatesFetch: state.f5.certificatesFetch
}))(CertificatesManager);
