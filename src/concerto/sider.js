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

import IpSVG from '../svg/ip-address-svgrepo-com.svg'
import NetworkSVG from '../svg/layer-3-switch.svg'
import FirewallSVG from '../svg/firewall-svgrepo-com.svg'
import LoadbalancerSVG from '../svg/loadbalancer.svg'
import CertSVG from '../svg/certificates.svg'
import ItemsSVG from '../svg/items.svg'
import VmSVG from '../svg/vm.svg'
import PermissionsPNG from '../svg/icons8-diritti-utente-50.png'
import TriggersPNG from '../svg/icons8-priorità-media-50.png'

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
  permissionsIcon = () => (
      <img src={PermissionsPNG} alt="PermissionsPNG" width="23" height="23" />
  );
  triggersIcon = () => (
      <img src={TriggersPNG} alt="TriggersPNG" width="21" height="21" />
  );

  //heartIcon = props => {<Icon component={LoadbalancerSVG} {...props} />}
  //  <Icon component={() => (<img src={IpSVG} alt="IpSVG"/>)} />

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  render(){
    console.log(this.props.authorizations)
    console.log(this.props.authorizationsInfoblox)
    return (
      <Sider width={200} style={{backgroundColor: 'white'}} className="site-layout-background" trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={100}>
        <Button type="primary" onClick={this.toggle} style={{ margin: '20px auto', display: 'block' }}>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
          </Button>
        <Divider style={{border: 'vh solid #f0f2f5'}}/>
        <Menu
          mode="inline"
          style={{ borderRight: 0 }}
        >

        {!this.props.authorizationsFortinetdb ?
          null
        :
          <Menu.Item key="homepage" icon={<HomeOutlined style={{fontSize:'20px'}} />} ><Link to="/">HOME</Link></Menu.Item>
        }


          { (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsCheckpoint && this.authorizators(this.props.authorizationsCheckpoint)) ||
            (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="historys" icon={<ClockCircleOutlined style={{fontSize:'20px'}} />} ><Link to="/historys/">HISTORY</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
            </React.Fragment>
          :
            null
          }

          <React.Fragment>
            {this.props.authorizationsFortinetdb && (this.authorizatorsSA(this.props.authorizations) || this.props.authorizationsFortinetdb.view_interface_tables) ?
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

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsInfoblox && this.props.authorizationsInfoblox.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="infoblox" icon={this.ipIcon()}><Link to="/infoblox/">INFOBLOX</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsCheckpoint && this.props.authorizationsCheckpoint.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="checkpoint" icon={this.firewallIcon()}><Link to="/checkpoint/">CHECKPOINT</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsF5 && this.props.authorizationsF5.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="f5" icon={this.loadbalancerIcon()}><Link to="/f5/">F5</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          {/* (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsF5 && this.props.authorizationsF5.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="f5bis" icon={this.loadbalancerIcon()}><Link to="/f5bis/">F5bis</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
        */}

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsVmware && this.props.authorizationsVmware.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="vmware" icon={this.vmIcon()}><Link to="/vmware/">VMWARE</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            : null
          }

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) || (this.props.authorizationsF5 && this.props.authorizationsF5.full_visibility) ?
            <React.Fragment>
              <Menu.Item key="certificates" icon={this.certIcon()}><Link to="/certificatesAndKeys/">CERTIFICATES</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
            </React.Fragment>
            :
            null
          }


          { (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsCheckpoint && this.authorizators(this.props.authorizationsCheckpoint)) ||
            (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="services" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/services/">SERVICES</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
          :
            null
          }

          { this.authorizatorsSA(this.props.authorizations) || this.authorizators(this.props.authorizationsWorkflow) ?
            <React.Fragment>
              <Menu.Item key="workflows" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/workflows/">WORKFLOWS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
          :
            null
          }

          <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          { (this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox)) ||
            (this.props.authorizationsCheckpoint && this.authorizators(this.props.authorizationsCheckpoint)) ||
            (this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5)) ||
            (this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware)) ?
            <React.Fragment>
              <Menu.Item key="assets" icon={this.itemsIcon()}><Link to="/assets/">ASSETS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
            null
          }

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) ||
            (this.props.authorizationsInfoblox && this.props.authorizationsInfoblox.permission_identityGroups_post) ||
            (this.props.authorizationsCheckpoint && this.props.authorizationsCheckpoint.permission_identityGroups_post) ||
            (this.props.authorizationsF5 && this.props.authorizationsF5.permission_identityGroups_post) ||
            (this.props.authorizationsVmware && this.props.authorizationsVmware.permission_identityGroups_post) ||
            (this.props.authorizationsFortinetdb && this.props.authorizationsFortinetdb.permission_identityGroups_post) ?
            <React.Fragment>
              <Menu.Item key="permissions" icon={this.permissionsIcon()}><Link to="/permissions/">PERMISSIONS</Link></Menu.Item>
              <Menu.Divider/>
            </React.Fragment>
            :
             null
          }

          { (this.props.authorizations && this.authorizatorsSA(this.props.authorizations)) ?
            <React.Fragment>
              <Menu.Item key="triggers" icon={this.triggersIcon()}><Link to="/triggers/">TRIGGERS</Link></Menu.Item>
              <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
            </React.Fragment>
          :
            null
          }

          { this.authorizatorsSA(this.props.authorizations) ?
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
  authorizationsWorkflow: state.authorizations.workflow,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsF5: state.authorizations.f5,
  authorizationsVmware: state.authorizations.vmware,
  authorizationsFortinetdb: state.authorizations.fortinetdb,
}))(CustomSider);
