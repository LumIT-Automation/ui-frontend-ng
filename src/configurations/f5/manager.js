import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error/f5Error'
import Rest from '../../_helpers/Rest'

import {
  configurationLoading,
  configuration,
  configurationFetch,
  configurationError,

} from '../../_store/store.f5'

import List from './list'

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.configurationError) {
      this.props.dispatch(configurationFetch(false))
      if (!this.props.configuration) {
        this.main()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.configurationFetch) {
      this.main()
      this.props.dispatch(configurationFetch(false))
    }
  }

  componentWillUnmount() {
  }


  main = async () => {
    this.props.dispatch(configurationLoading(true))

    let fetchedConfiguration = await this.fetchConfiguration()
    if (fetchedConfiguration.status && fetchedConfiguration.status !== 200 ) {
      this.props.dispatch(configurationError(fetchedConfiguration))
      this.props.dispatch(configurationLoading(false))
      return
    }
    else {
      this.props.dispatch(configuration( JSON.parse(fetchedConfiguration.data.configuration) ))
      this.props.dispatch(configurationLoading(false))
    }
  }

  fetchConfiguration = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR("f5/configuration/global/", this.props.token)
    return r
  }



  render() {
    return (
      <React.Fragment>

        <List/>

        { this.props.configurationError ? <Error component={'manager f5'} error={[this.props.configurationError]} visible={true} type={'configurationError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  configurationError: state.f5.configurationError,
  configuration: state.f5.configuration,
  configurationFetch: state.f5.configurationFetch,
}))(Manager);
