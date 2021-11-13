import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest"
import Error from '../../../error'

import { setError } from '../../../_store/store.error'
import { setKeysLoading, setKeys, setKeysFetch } from '../../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd'



class Manager extends React.Component {

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
      if (!this.props.keysError) {
        if (!this.props.keys) {
          this.fetchKeys()
          this.props.dispatch(setKeysFetch(false))
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset) {
      if (!this.props.keys) {
        this.fetchKeys()
      }
      if ( ((prevProps.asset !== this.props.asset) && (this.props.asset !== null)) ) {
        this.fetchKeys()
      }
      if (this.props.keysFetch) {
        this.fetchKeys()
        this.props.dispatch(setKeysFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }




  fetchKeys = async () => {
    this.props.dispatch(setKeysLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setKeys( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
    this.props.dispatch(setKeysLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} visible={true} />
        :
          <React.Fragment>
            <br/>
            { (this.props.asset && this.props.asset.id ) ?
              this.props.authorizations && (this.props.authorizations.keys_post || this.props.authorizations.any) ?
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
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  keys: state.f5.keys,
  keysFetch: state.f5.keysFetch
}))(Manager);
