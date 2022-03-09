import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Alert } from 'antd'

import Rest from '../../../_helpers/Rest'
import Error from '../../../f5/error'

import {
  certificatesLoading,
  certificates,
  certificatesFetch,
  certificatesError
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
      if (!this.props.certificatesError) {
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
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) && (this.props.partition !== null) ) {
      if (!this.props.certificates) {
        this.certificatesGet()
      }
    }

    if (this.props.asset && this.props.partition) {
      if (this.props.certificatesFetch) {
        this.certificatesGet()
        this.props.dispatch(certificatesFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }



  certificatesGet = async () => {
    this.props.dispatch(certificatesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(certificates( resp ))
      },
      error => {
        this.props.dispatch(certificatesError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/certificates/`, this.props.token)
    this.props.dispatch(certificatesLoading(false))
  }


  render() {

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

        { this.props.certificatesError ? <Error component={'certificates manager f5'} error={[this.props.certificatesError]} visible={true} type={'certificatesError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,

  certificates: state.f5.certificates,
  certificatesFetch: state.f5.certificatesFetch,
  certificatesError:  state.f5.certificatesError
}))(Manager);
