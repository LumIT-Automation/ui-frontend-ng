import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Alert } from 'antd'

import Rest from '../../../_helpers/Rest'
import Error from '../../../f5/error'

import {
  keysLoading,
  keys,
  keysFetch,
  keysError
} from '../../../f5/store.f5'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.keysError) {
        this.props.dispatch(keysFetch(false))
        if (!this.props.keys) {
          this.keysGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) ) {
      if (!this.props.keys) {
        this.keysGet()
      }
      if (this.props.keysFetch) {
        this.keysGet()
        this.props.dispatch(keysFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.keysGet()
      }
    }
  }

  componentWillUnmount() {
  }



  keysGet = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/keys/`, this.props.token)
    this.props.dispatch(keysLoading(false))
  }


  render() {

    return (
      <React.Fragment>
        <br/>
        { (this.props.asset && this.props.asset.id ) && this.props.partition  ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.keys_post || this.props.authorizations.any) ?
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
