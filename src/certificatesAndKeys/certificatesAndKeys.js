import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd';

import Rest from "../_helpers/Rest"
import Error from '../error'

import AssetSelector from './assetSelector'
import CertificatesManager from './f5/certificates/manager'
import KeysManager from './f5/keys/manager'


import { setAssets, setCertificatesFetchStatus, setKeysFetchStatus } from '../_store/store.f5'



import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const refreshIcon = <ReloadOutlined style={{color: 'white' }}  />
//const { Search } = Input;


/*
This is the parent component of the f5 category.

At mount it calls /assets/ to get the list of assets present in udb and it sets it in the store.
The other components will recive as props:
  state.f5.assets

Then render sub Tabs

if there is a error (no assetList in the response) renders Error component.
It also pass to Error's props the callback resetError() in order to reset Error state and haide Error component.

At the unmount it reset state.f5 in the store.
*/


class CertificatesAndKeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      this.fetchAssets()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setAssets( resp )))
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }


  certificatesRefresh = () => {
    this.props.dispatch(setCertificatesFetchStatus('updated'))
  }

  keysRefresh = () => {
    this.props.dispatch(setKeysFetchStatus('updated'))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
          <TabPane tab="F5" key="2">
            {this.state.loading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
            <React.Fragment>
              <div style={{margin: '0 130px'}}>
                <AssetSelector />
              </div>
            <Divider/>
            <Tabs type="card" destroyInactiveTabPane={true}>
              { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
                <TabPane key="Certificates"tab=<span>Certificates <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.certificatesRefresh()}/></span>>
                  {this.props.certificatesLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <CertificatesManager/> }
                </TabPane>
                : null
              }
              { this.props.authorizations && (this.props.authorizations.keys_get || this.props.authorizations.any) ?
                <TabPane key="Keys"tab=<span>Keys <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.keysRefresh()}/></span>>
                  {this.props.keysLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <KeysManager/> }
                </TabPane>
                : null
              }
              {/* this.props.authorizations && (this.props.authorizations.certificate_post || this.props.authorizations.any) ?
                <TabPane tab="Certificates" key="4">
                  <CertificateAndKey/>
                </TabPane>
                : null
              */}

            </Tabs>

            </React.Fragment>
            }
          </TabPane>
        </Tabs>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  certificatesLoading: state.f5.certificatesLoading,
  keysLoading: state.f5.keysLoading,
}))(CertificatesAndKeys);
