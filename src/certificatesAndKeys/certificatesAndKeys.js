import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import AssetSelector from './assetSelector'
import CertificatesManager from './f5/certificates/manager'
import KeysManager from './f5/keys/manager'

import Rest from "../_helpers/Rest";
import { setAssetList, cleanUp } from '../_store/store.f5'

import Error from '../error'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
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
    if (this.props.token) {
      this.fetchAssets()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
    this.props.dispatch(cleanUp())
  }


  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setAssetList( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {

    //console.log(this.props.permissions)

    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
          <TabPane tab="F5" key="2">
            {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> :
            <React.Fragment>
              <div style={{margin: '0 150px'}}>
                <AssetSelector />
              </div>
            <Divider/>
            <Tabs type="card" destroyInactiveTabPane={true}>
              { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
                <TabPane tab="Certificates" key="Certificates">
                  <CertificatesManager/>
                </TabPane>
                : null
              }
              { this.props.authorizations && (this.props.authorizations.keys_get || this.props.authorizations.any) ?
                <TabPane tab="Keys" key="Keys">
                  <KeysManager/>
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
  asset: state.f5.asset,
  partition: state.f5.partition
}))(CertificatesAndKeys);
