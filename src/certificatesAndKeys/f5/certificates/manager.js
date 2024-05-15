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
  certificates,
  certificatesFetch,
} from '../../../f5/store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.error) {
        this.props.dispatch(certificatesFetch(false))
        if (!this.props.certificates) {
          this.certificatesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.error) {

      if (this.props.asset && this.props.partition && this.props.certificatesFetch) {
        this.props.dispatch(certificatesFetch(false))
        this.certificatesGet()        
      }

      if ( this.props.asset && (this.props.partition && (this.props.partition !== prevProps.partition)) && (this.props.partition !== null) ) {
        if (!this.props.certificates) {
          this.certificatesGet()
        }
      }
    }
  }

  componentWillUnmount() {
  }



  certificatesGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(certificates( resp ))
      },
      error => {
        error = Object.assign(error, {
          component: 'certManager',
          vendor: 'f5',
          errorType: 'certificatesError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/certificates/`, this.props.token)
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'certManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <br/>
        { (this.props.asset && this.props.asset.id ) && this.props.partition  ?
          <React.Fragment>
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

  certificates: state.f5.certificates,
  certificatesFetch: state.f5.certificatesFetch,
}))(Manager);
