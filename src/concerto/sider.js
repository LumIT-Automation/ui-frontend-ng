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
  FastForwardOutlined
 } from '@ant-design/icons';

import FirewallSVG from '../svg/firewall-svgrepo-com.svg'
import IpSVG from '../svg/ip-address-svgrepo-com.svg'
import NetworkSVG from '../svg/layer-3-switch.svg'
import LoadbalancerSVG from '../svg/loadbalancer.svg'
import CertSVG from '../svg/certificates.svg'
import ItemsSVG from '../svg/items.svg'
import VmSVG from '../svg/vm.svg'

const { Sider } = Layout;



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
  vmIcon = () => (
      <img src={VmSVG} alt="VmSVG" width="20" height="20" />
  );

  //heartIcon = props => {<Icon component={LoadbalancerSVG} {...props} />}
  //  <Icon component={() => (<img src={IpSVG} alt="IpSVG"/>)} />

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  render(){
    console.log(this.props.authorizationsF5)
    console.log(this.props.authorizationsFortinetdb)

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
          { (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="historys" icon={<ClockCircleOutlined style={{fontSize:'20px'}} />} ><Link to="/historys/">HISTORY</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
            </React.Fragment>
          :
            null
          }

          <React.Fragment>
            { (this.props.authorizationsFortinetdb && (this.props.authorizationsFortinetdb.interface_tables_view || this.props.authorizationsFortinetdb.any)) ?
              <React.Fragment>
                <Menu.Item key="projects" icon={this.itemsIcon()}><Link to="/projects/">PROJECT</Link></Menu.Item>
                <Menu.Item key="devices" icon={this.itemsIcon()}><Link to="/devices/">DEVICE</Link></Menu.Item>
                <Menu.Item key="ddosses" icon={this.itemsIcon()}><Link to="/ddosses/">DDOS</Link></Menu.Item>
                <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
              </React.Fragment>
              :
                null
            }
          </React.Fragment>

          { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
            <React.Fragment>
              <Menu.Item key="infoblox" icon={this.ipIcon()}><Link to="/infoblox/">INFOBLOX</Link></Menu.Item>
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
            <React.Fragment>
              <Menu.Item key="vmware" icon={this.vmIcon()}><Link to="/vmware/">VMWARE</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
            <React.Fragment>
              <Menu.Item key="certificates" icon={this.certIcon()}><Link to="/certificatesAndKeys/">CERTIFICATES</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
            </React.Fragment>
            :
            null
          }


          { (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="services" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/services/">SERVICES</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
          :
            null
          }

          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          { (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="assets" icon={this.itemsIcon()}><Link to="/assets/">ASSETS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
            null
          }

          { (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ||
            (this.props.authorizationsFortinetdb && this.props.authorizationsFortinetdb.any && this.authorizators(this.props.authorizationsFortinetdb)) ?
            <React.Fragment>
              <Menu.Item key="permissions" icon={<HomeOutlined style={{fontSize:'20px'}}/>}><Link to="/permissions/">PERMISSIONS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
             null
          }

          { (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
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
  authorizationsVmware: state.authorizations.vmware,
  authorizationsFortinetdb: state.authorizations.fortinetdb,
}))(CustomSider);
