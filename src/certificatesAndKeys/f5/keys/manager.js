import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Alert } from 'antd'

import Rest from '../../../_helpers/Rest'
import Error from '../../../concerto/error'

import {
  err
} from '../../../concerto/store'

import {
  keys,
  keysFetch,
} from '../../../f5/store'

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
      if (!this.props.error) {
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
    if (!this.props.error) {

      if (this.props.asset && this.props.partition && this.props.keysFetch) {
        this.props.dispatch(keysFetch(false))
        this.keysGet()        
      }

      if ( this.props.asset && (this.props.partition && (this.props.partition !== prevProps.partition)) && (this.props.partition !== null) ) {
        if (!this.props.keys) {
          this.keysGet()
        }
      }
    }
  }

  componentWillUnmount() {
  }



  keysGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(keys( resp ))
      },
      error => {
        error = Object.assign(error, {
          component: 'keysManager',
          vendor: 'f5',
          errorType: 'keysError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/keys/`, this.props.token)
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'keysManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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

      {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  keys: state.f5.keys,
  keysFetch: state.f5.keysFetch,
}))(Manager);
