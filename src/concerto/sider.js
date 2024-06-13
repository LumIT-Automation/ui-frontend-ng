import React, { useState, useEffect } from 'react';
import { Component, } from "react";
import { Link } from 'react-router-dom'
import {connect} from "react-redux";
import Authorizators from '../_helpers/authorizators'

import '../sider.css';
import { Menu } from 'antd';
import { Layout, Divider, Button } from 'antd';
import {
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


function CustomSider(props) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    setCollapsed(!collapsed)
  };

  const firewallIcon = () => (
    <img src={FirewallSVG} alt="FirewallSVG" width="20" height="20" color="red" />
  );
  const ipIcon = () => (
    <img src={IpSVG} alt="IpSVG" width="20" height="20"/>
  );
  const networkIcon = () => (
    <img src={NetworkSVG} alt="NetworkSVG"/>
  );
  const loadbalancerIcon = () => (
    <img src={LoadbalancerSVG} alt="LoadbalancerSVG" width="20" height="20"/>
  );
  const certIcon = () => (
      <img src={CertSVG} alt="certificatesSVG" width="20" height="20" />
  );
  const itemsIcon = () => (
      <img src={ItemsSVG} alt="certificatesSVG" width="20" height="20" />
  );
  const vmIcon = () => (
      <img src={VmSVG} alt="VmSVG" width="20" height="20" />
  );
  const permissionsIcon = () => (
      <img src={PermissionsPNG} alt="PermissionsPNG" width="23" height="23" />
  );
  const triggersIcon = () => (
      <img src={TriggersPNG} alt="TriggersPNG" width="21" height="21" />
  );

  //heartIcon = props => {<Icon component={LoadbalancerSVG} {...props} />}
  //  <Icon component={() => (<img src={IpSVG} alt="IpSVG"/>)} />

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  return (
    <Sider width={200} style={{backgroundColor: 'white'}} className="site-layout-background" trigger={null} collapsible collapsed={collapsed} collapsedWidth={100}>
      <Button type="primary" onClick={() => toggle()} style={{ margin: '20px auto', display: 'block' }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
        </Button>
      <Divider style={{border: 'vh solid #f0f2f5'}}/>
      <Menu
        mode="inline"
        style={{ borderRight: 0 }}
      >
        { isAuthorized(props.authorizations, 'infoblox') ||
          isAuthorized(props.authorizations, 'checkpoint') ||
          isAuthorized(props.authorizations, 'f5') ||
          isAuthorized(props.authorizations, 'vmware') ?
          <React.Fragment>
            <Menu.Item key="historys" icon={<ClockCircleOutlined style={{fontSize:'20px'}} />} ><Link to="/historys/">HISTORY</Link></Menu.Item>
            <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          </React.Fragment>
        :
          null
        }

        { isAuthorized(props.authorizations, 'infoblox', 'full_visibility') ?
          <React.Fragment>
            <Menu.Item key="infoblox" icon={ipIcon()}><Link to="/infoblox/">INFOBLOX</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          : null
        }

        { isAuthorized(props.authorizations, 'checkpoint', 'full_visibility') ?
          <React.Fragment>
            <Menu.Item key="checkpoint" icon={firewallIcon()}><Link to="/checkpoint/">CHECKPOINT</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          : null
        }

        { isAuthorized(props.authorizations, 'f5', 'full_visibility') ?
          <React.Fragment>
            <Menu.Item key="f5" icon={loadbalancerIcon()}><Link to="/f5/">F5</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          : null
        }

        { isAuthorized(props.authorizations, 'vmware', 'full_visibility') ?
          <React.Fragment>
            <Menu.Item key="vmware" icon={vmIcon()}><Link to="/vmware/">VMWARE</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          : null
        }

        { isAuthorized(props.authorizations, 'f5', 'full_visibility') ?
          <React.Fragment>
            <Menu.Item key="certificates" icon={certIcon()}><Link to="/certificatesAndKeys/">CERTIFICATES</Link></Menu.Item>
            <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          </React.Fragment>
          :
          null
        }


        { isAuthorized(props.authorizations, 'infoblox') ||
          isAuthorized(props.authorizations, 'checkpoint') ||
          isAuthorized(props.authorizations, 'f5') ||
          isAuthorized(props.authorizations, 'vmware') ?
          <React.Fragment>
            <Menu.Item key="services" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/services/">SERVICES</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
        :
          null
        }

        { isAuthorized(props.authorizations, 'workflow') ?
          <React.Fragment>
            
            <Menu.Item key="workflows" icon={<FastForwardOutlined style={{fontSize:'20px'}}/>}><Link to="/workflows/">WORKFLOWS</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
        :
          null
        }

        <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
        { isAuthorized(props.authorizations, 'infoblox') ||
          isAuthorized(props.authorizations, 'checkpoint') ||
          isAuthorized(props.authorizations, 'f5') ||
          isAuthorized(props.authorizations, 'vmware') ?
          <React.Fragment>
            <Menu.Item key="assets" icon={itemsIcon()}><Link to="/assets/">ASSETS</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          :
          null
        }

        { isAuthorized(props.authorizations, 'infoblox', 'permission_identityGroups_post') ||
          isAuthorized(props.authorizations, 'checkpoint', 'permission_identityGroups_post') ||
          isAuthorized(props.authorizations, 'f5', 'permission_identityGroups_post') ||
          isAuthorized(props.authorizations, 'vmware', 'permission_identityGroups_post') ?
          <React.Fragment>
            <Menu.Item key="permissions" icon={permissionsIcon()}><Link to="/permissions/">PERMISSIONS</Link></Menu.Item>
            <Menu.Divider/>
          </React.Fragment>
          :
            null
        }

        { authorizatorsSA(props.authorizations) ?
          <React.Fragment>
            <Menu.Item key="triggers" icon={triggersIcon()}><Link to="/triggers/">TRIGGERS</Link></Menu.Item>
            <Menu.Divider style={{border: '1vh solid #f0f2f5'}}/>
          </React.Fragment>
        :
          null
        }

        { authorizatorsSA(props.authorizations) ?
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

export default connect((state) => ({
  authorizations: state.authorizations
}))(CustomSider);
