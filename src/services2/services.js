import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'
import { setAssets as setF5Assets } from '../_store/store.f5'
import { setAssets as setInfobloxAssets } from '../_store/store.infoblox'

import InfobloxManager from './infoblox/manager'

import { Space, Row, Col, Collapse, Divider } from 'antd';
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



class Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
    };
  }

  componentDidMount() {
    if (this.props.f5Authorizations && (this.props.f5Authorizations.assets_get || this.props.f5Authorizations.any ) ) {
      if(!this.props.f5Assets) {
        this.fetchF5Assets()
      }
    }
    if (this.props.infobloxAuthorizations && (this.props.infobloxAuthorizations.assets_get || this.props.infobloxAuthorizations.any ) ) {
      if(!this.props.infobloxAssets) {
        this.fetchInfobloxAssets()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  fetchF5Assets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Assets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchInfobloxAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setInfobloxAssets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        {this.props.infobloxAssets ?
          <React.Fragment>
            <Divider orientation="left" plain>
              Infoblox
            </Divider>
            <InfobloxManager/>
          </React.Fragment>
          :
          null
        }
        {this.props.f5Assets ?
          <React.Fragment>
            <Divider orientation="left" plain>
              Infoblox
            </Divider>
            <InfobloxManager/>
          </React.Fragment>
          :
          null
        }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  f5Authorizations: state.authorizations.f5,
  infobloxAuthorizations: state.authorizations.infoblox,

  f5Assets: state.f5.assets,
  infobloxAssets: state.infoblox.assets
}))(Service);
