import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd';

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'

import AssetSelector from './assetSelector'
import CertificatesManager from './f5/certificates/manager'
import KeysManager from './f5/keys/manager'

import { setAssets, setCertificatesFetch, setKeysFetch } from '../_store/store.f5'

import 'antd/dist/antd.css';
import '../App.css'

import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }


  certificatesRefresh = () => {
    this.props.dispatch(setCertificatesFetch(true))
  }

  keysRefresh = () => {
    this.props.dispatch(setKeysFetch(true))
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
          <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
            <Tabs type="card">
              <TabPane tab="F5" key="2">
                {this.props.certificatesLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
                <React.Fragment>
                  <div style={{margin: '0 130px'}}>
                    <AssetSelector />
                  </div>
                <Divider/>
                <Tabs type="card">
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
          </Space>
        }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,

  certificatesLoading: state.f5.certificatesLoading,
  keysLoading: state.f5.keysLoading,
}))(CertificatesAndKeys);
