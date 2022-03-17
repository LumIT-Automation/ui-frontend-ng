import React from 'react'
import { Component, } from "react";
import { Link } from 'react-router-dom'
import {connect} from "react-redux";
import Authorizators from '../_helpers/authorizators'

import '../sider.css';
import { Menu } from 'antd';
import { Layout, Divider, Button } from 'antd';
import {
  HomeOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ApartmentOutlined,
  FastForwardOutlined
 } from '@ant-design/icons';

import FirewallSVG from '../svg/firewall-svgrepo-com.svg'
import IpSVG from '../svg/ip-address-svgrepo-com.svg'
import NetworkSVG from '../svg/layer-3-switch.svg'
import LoadbalancerSVG from '../svg/loadbalancer.svg'
import CertSVG from '../svg/certificates.svg'
import ItemsSVG from '../svg/items.svg'

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
    <img src={FirewallSVG} alt="FirewallSVG" width="20" height="20" color="red" />
  );
  ipIcon = () => (
    <img src={IpSVG} alt="IpSVG" width="20" height="20"/>
  );
  networkIcon = () => (
    <img src={NetworkSVG} alt="NetworkSVG"/>
  );
  loadbalancerIcon = () => (
    <img src={LoadbalancerSVG} alt="LoadbalancerSVG" width="20" height="20"/>
  );
  certIcon = () => (
      <img src={CertSVG} alt="certificatesSVG" width="20" height="20" />
  );
  itemsIcon = () => (
      <img src={ItemsSVG} alt="certificatesSVG" width="20" height="20" />
  );

  //heartIcon = props => {<Icon component={LoadbalancerSVG} {...props} />}
  //  <Icon component={() => (<img src={IpSVG} alt="IpSVG"/>)} />

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  render(){

    //<Sider width={200} className="site-layout-background" trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={80}>
    //<Sider width={150} className="site-layout-background" trigger={null}>
    return (

      <Sider width={200} className="site-layout-background" trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={100}>
        <Button type="primary" onClick={this.toggle} style={{ margin: '20px auto', display: 'block' }}>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
          </Button>
        <Divider style={{border: 'vh solid #f0f2f5'}}/>
        <Menu
          mode="inline"
          style={{ borderRight: 0 }}
        >

          <Menu.Item key="homepage" icon={<HomeOutlined style={{fontSize:'20px'}} />} ><Link to="/">HOME</Link></Menu.Item>
          <Menu.Item key="historys" icon={<ClockCircleOutlined style={{fontSize:'20px'}} />} ><Link to="/historys/">HISTORY</Link></Menu.Item>
          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>


            <React.Fragment>
            {
              <React.Fragment>
              <Menu.Item key="projects" icon={this.itemsIcon()}><Link to="/projects/">PROJECT</Link></Menu.Item>
              <Menu.Item key="devices" icon={this.itemsIcon()}><Link to="/devices/">DEVICE</Link></Menu.Item>
              <Menu.Item key="ddosses" icon={this.itemsIcon()}><Link to="/ddosses/">DDOS</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
              </React.Fragment>
            }
            </React.Fragment>


          { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
            <React.Fragment>
              <Menu.Item key="infoblox" icon={this.ipIcon()}><Link to="/infoblox/">INFOBLOX</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { this.props.authorizationsCisco && this.authorizators(this.props.authorizationsCisco) ?
            <React.Fragment>
              <Menu.Item key="switch" icon={<ApartmentOutlined style={{fontSize:'20px'}}/>}><Link to="/switch/">SWITCH</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { this.props.authorizationsFortinet && this.authorizators(this.props.authorizationsFortinet) ?
            <React.Fragment>
              <Menu.Item key="firewall" icon={this.firewallIcon()}><Link to="/firewall/">FIREWALL</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
            <React.Fragment>
              <Menu.Item key="f5" icon={this.loadbalancerIcon()}><Link to="/f5/">F5</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
            <Menu.Item key="certificates" icon={this.certIcon()}><Link to="/certificatesAndKeys/">CERTIFICATES</Link></Menu.Item>
            :
            null
          }
          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>

          <Menu.Item key="services" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/services/">SERVICES</Link></Menu.Item>
          <Menu.Divider/>

          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ||
            this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
            <React.Fragment>
              <Menu.Item key="assets" icon={this.itemsIcon()}><Link to="/assets/">ASSETS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
            null
          }




          { (this.props.authorizationsF5 && (this.props.authorizationsF5.permission_identityGroups_get || this.props.authorizationsF5.any)) ||
            (this.props.authorizationsInfoblox && (this.props.authorizationsInfoblox.permission_identityGroups_get || this.props.authorizationsInfoblox.any)) ?
            <React.Fragment>
              <Menu.Item key="permissions" icon={<HomeOutlined style={{fontSize:'20px'}}/>}><Link to="/permissions/">PERMISSIONS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
             null
          }

          { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ||
            this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
            <React.Fragment>
              <Menu.Item key="configurations" icon={<SettingOutlined style={{fontSize:'20px'}}/>}><Link to="/configurations/">CONFIGURATIONS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
            null
          }
        </Menu>
      </Sider>
    )
  }

}

export default connect((state) => ({
  authorizations: state.authorizations,
  authorizationsF5: state.authorizations.f5,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsFortinetDb: state.authorizations.fortinetdb,
}))(CustomSider);
