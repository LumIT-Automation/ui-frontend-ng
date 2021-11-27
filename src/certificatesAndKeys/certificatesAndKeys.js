import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd';

import Rest from "../_helpers/Rest"
import Error from '../error/f5Error'

import AssetSelector from './assetSelector'
import CertificatesManager from './f5/certificates/manager'
import KeysManager from './f5/keys/manager'

import {
  setAssets,
  setAssetsError,
  setCertificatesFetch,
  setKeysFetch
} from '../_store/store.f5'

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
        this.props.dispatch(setAssetsError(error))
        this.setState({loading: false})
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


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
        <Tabs type="card">
          <TabPane tab="F5" key="2">
            {this.state.loading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
            <React.Fragment>
              <div style={{margin: '0 130px'}}>
                <AssetSelector />
              </div>
            <Divider/>
            <Tabs type="card">
              { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
                <React.Fragment>
                  {this.props.certificatesLoading ?
                    <TabPane key="Certificates" tab="Certificates">
                      <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                    </TabPane>
                    :
                    <TabPane key="Certificates" tab=<span>Certificates <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.certificatesRefresh()}/></span>>
                      <CertificatesManager/>
                    </TabPane>
                  }
                </React.Fragment>
                :
                null
              }

              { this.props.authorizations && (this.props.authorizations.keys_get || this.props.authorizations.any) ?
                <React.Fragment>
                  {this.props.keysLoading ?
                    <TabPane key="Keys" tab="Keys">
                      <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                    </TabPane>
                    :
                    <TabPane key="Keys" tab=<span>Keys <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.keysRefresh()}/></span>>
                      <KeysManager/>
                    </TabPane>
                  }
                </React.Fragment>
                :
                null
              }


            </Tabs>

            </React.Fragment>
            }
          </TabPane>
        </Tabs>

        { this.props.assetsError ? <Error component={'certKey manager f5'} error={[this.props.assetsError]} visible={true} type={'setAssetsError'} /> : null }

      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  assetsError: state.f5.assetsError,

  certificatesLoading: state.f5.certificatesLoading,
  keysLoading: state.f5.keysLoading,
}))(CertificatesAndKeys);
