import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest"
import Error from "../../../error/f5Error"

import {
  keysLoading,
  keys,
  keysFetch,
  keysError
} from '../../../_store/store.f5'

import List from './list'
import Add from './add'

import { Alert } from 'antd'



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
    if (!this.props.keysError) {
      if (this.props.asset && this.props.partition) {
        this.props.dispatch(keysFetch(false))
        if (!this.props.keys) {
          this.fetchKeys()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.keys && this.props.asset && this.props.partition ) {
      this.fetchKeys()
    }

    if (this.props.keysFetch && this.props.asset && this.props.partition ) {
      this.fetchKeys()
      this.props.dispatch(keysFetch(false))
    }
  }

  componentWillUnmount() {
  }




  fetchKeys = async () => {
    this.props.dispatch(keysLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(keys( resp ))
      },
      error => {
        this.props.dispatch(keysError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
    this.props.dispatch(keysLoading(false))
  }


  render() {
    return (
      <React.Fragment>
        <br/>
        { (this.props.asset && this.props.asset.id ) && this.props.partition  ?
          <React.Fragment>
          {/*certificates_post da sostituire con keys_post*/}
            {this.props.authorizations && (this.props.authorizations.certificates_post || this.props.authorizations.any) ?
              <React.Fragment>
                <Add/>
                <br/>
                <br/>
              </React.Fragment>
            :
              null
            }
            <List/>
            </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }

        { this.props.keysError ? <Error component={'keys manager f5'} error={[this.props.keysError]} visible={true} type={'keysError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,

  keys: state.f5.keys,
  keysFetch: state.f5.keysFetch,
  keysError:  state.f5.keysError
}))(Manager);
