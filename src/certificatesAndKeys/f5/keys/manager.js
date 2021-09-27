import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest"
import Error from '../../../error'

import { setKeysLoading, setKeys, setKeysFetchStatus } from '../../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd'
import Highlighter from 'react-highlight-words'




/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


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
      if (!this.props.keys) {
        this.fetchKeys()
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
      if ( (this.props.keysFetchStatus === 'updated') ) {
        this.fetchKeys()
        this.props.dispatch(setKeysFetchStatus(''))
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
        this.setState({error: error})
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
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { (this.props.asset && this.props.asset.id ) ?
           this.props.authorizations && (this.props.authorizations.keys_post || this.props.authorizations.any) ?
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

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  keys: state.f5.keys,
  keysFetchStatus: state.f5.keysFetchStatus
}))(Manager);
