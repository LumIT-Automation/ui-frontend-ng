import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Authorizators from '../_helpers/authorizators'
import F5 from '../f5/configuration/manager'

import { configurationFetch as configurationF5Fetch } from '../f5/store'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Configuration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
              <React.Fragment>
                {this.props.configurationF5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(configurationF5Fetch(true))}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
            :
              null
            }
          </Tabs>
        </Space>

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  authorizationsF5: state.authorizations.f5,
  configurationF5Loading: state.f5.configurationLoading
}))(Configuration);
