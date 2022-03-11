import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

import { ddosses, ddossesLoading, ddossesError, ddossesFetch } from './store.fortinetdb'

import List from './ddosses/list'

import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Ddosses extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (!this.props.ddosses || this.props.ddosses.length === 0) {
      this.fetchDdosses()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.ddossesFetch) {
      this.fetchDdosses()
      this.props.dispatch(ddossesFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchDdosses = async () => {
    this.props.dispatch(ddossesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(ddosses(resp))
      },
      error => {
        this.props.dispatch(ddossesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/ddosses/`, this.props.token)
    this.props.dispatch(ddossesLoading(false))
  }

  ddossesRefresh = () => {
    this.props.dispatch(ddossesFetch(true))
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            {this.props.ddossesLoading ?
              <TabPane key="ddosses" tab="Ddosses">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
            :
              <TabPane key="ddosses" tab=<span>Ddosses<ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.ddossesRefresh()}/></span>>
                <List height={600} pagination={10}/>
              </TabPane>
            }
          </Tabs>

        </Space>

        { this.props.ddossesError ? <Error component={'fortinetdb ddosses'} error={[this.props.ddossesError]} visible={true} type={'ddossesError'} /> : null }

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,

  fortinetdbauth: state.authorizations.fortinetdb,

  ddossesLoading: state.fortinetdb.ddossesLoading,
  ddosses: state.fortinetdb.ddosses,
  ddossesError: state.fortinetdb.ddossesError,
  ddossesFetch: state.fortinetdb.ddossesFetch
}))(Ddosses);
