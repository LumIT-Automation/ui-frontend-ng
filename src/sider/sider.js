import React from 'react'
import { Component, } from "react";
import { Link } from 'react-router-dom'
import {connect} from "react-redux";

import '../sider.css';
import { Menu } from 'antd';
import { Layout, Divider, Button } from 'antd';
import { HomeOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  NotificationOutlined,
  ApartmentOutlined,
  FastForwardOutlined

 } from '@ant-design/icons';

import Icon from '@ant-design/icons';

import FirewallSVG from '../svg/firewall-svgrepo-com.svg'
import IpSVG from '../svg/ip-address-svgrepo-com.svg'
import NetworkSVG from '../svg/layer-3-switch.svg'
import LoadbalancerSVG from '../svg/loadbalancer.svg'
import F5SVG from '../svg/f5_Networks-Logo.wine.svg'
import CertSVG from '../svg/certificates.svg'
import ItemsSVG from '../svg/items.svg'
import MyIcon from '../svg/ipIcon.js'

const { Sider } = Layout;

/*
The app is currently divided by appliance categories.
The categories are for example:
  Ipam,
  Switch,
  Loadbalancer,
  Firewall,
  Hypervisor
In the sider each category is a Link that will indicate to the App which component to render.

The Link component of the Router differs from the <a> tag because it does not make the call to the backend (preventDefault ())
In this way the route is intercepted by the Router
*/

class CustomSider extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  componentDidMount() {
  }

  toggle = () => {
    this.setState({collapsed: !this.state.collapsed});
  };

  firewallIcon = () => (
    <img src={FirewallSVG} alt="FirewallSVG" width="40" height="40" color="red" />
  );
  ipIcon = () => (
    <img src={IpSVG} alt="IpSVG" width="40" height="40"/>
  );
  networkIcon = () => (
    <img src={NetworkSVG} alt="NetworkSVG"/>
  );
  loadbalancerIcon = () => (
    <img src={LoadbalancerSVG} alt="LoadbalancerSVG" width="40" height="40"/>
  );
  certIcon = () => (
      <img src={CertSVG} alt="certificatesSVG" width="40" height="40" />
  );
  itemsIcon = () => (
      <img src={ItemsSVG} alt="certificatesSVG" width="40" height="40" />
  );

  //heartIcon = props => {<Icon component={LoadbalancerSVG} {...props} />}
  //  <Icon component={() => (<img src={IpSVG} alt="IpSVG"/>)} />

  render(){
    //<Sider width={200} className="site-layout-background" trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={80}>
    //<Sider width={150} className="site-layout-background" trigger={null}>
    return (

      <Sider width={250} className="site-layout-background" trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={100}>
        <Button type="primary" onClick={this.toggle} style={{ margin: '20px auto', display: 'block' }}>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
          </Button>
        <Divider style={{border: '1vh solid #f0f2f5'}}/>
        <Menu
          mode="inline"
          style={{ borderRight: 0 }}
        >
          <Menu.Item key="homepage" height={35} icon={<HomeOutlined style={{fontSize:'40px'}} />} ><Link to="/">HOME</Link></Menu.Item>
          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>

          <Menu.Item key="ipam" height={350} icon={this.ipIcon()}><Link to="/ipam/">IPAM</Link></Menu.Item>
          <Menu.Divider/>

          <Menu.Item key="switch" icon={<ApartmentOutlined style={{fontSize:'40px'}}/>}><Link to="/switch/">SWITCH</Link></Menu.Item>
          <Menu.Divider/>

          <Menu.Item key="firewall" icon={this.firewallIcon()}><Link to="/firewall/">FIREWALL</Link></Menu.Item>
          <Menu.Divider/>

          <Menu.Item key="f5" icon={this.loadbalancerIcon()}><Link to="/f5/">F5</Link></Menu.Item>
          <Menu.Divider/>

          { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
            <Menu.Item key="certificates" icon={this.certIcon()}><Link to="/certificatesAndKeys/">CERTIFICATES and KEYS</Link></Menu.Item>
            :
            null
          }
          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>

          <Menu.Item key="workflows" icon={<FastForwardOutlined style={{fontSize:'40px'}}/>}><Link to="/workflows/">WORKFLOWS</Link></Menu.Item>
          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>

          { this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any) ?
            <React.Fragment>
              <Menu.Item key="assets" icon={this.itemsIcon()}><Link to="/assets/">ASSETS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
            null
          }




          { this.props.authorizations && (this.props.authorizations.permission_identityGroups_get || this.props.authorizations.any) ?
            <React.Fragment>
              <Menu.Item key="permissions" icon={<HomeOutlined style={{fontSize:'40px'}}/>}><Link to="/permissions/">PERMISSIONS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
             null
          }

          <Menu.Item key="settings" icon={<SettingOutlined style={{fontSize:'40px'}}/>}><Link to="/settings/">SETTINGS</Link></Menu.Item>
        </Menu>
      </Sider>
    )
  }

}

export default connect((state) => ({
  authenticated: state.ssoAuth.authenticated,
  username: state.ssoAuth.username,
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  permissions: state.permissions
}))(CustomSider);
