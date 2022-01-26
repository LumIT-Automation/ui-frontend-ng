import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import Rest from "../_helpers/Rest"

import { setProjects, setProjectsLoading, setProjectsError, setProjectsFetch } from '../_store/store.fortinetdb'

import List from './projects/list'

import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Projects extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (!this.props.projects) {
      this.fetchProjects()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.projectsFetch) {
      this.fetchProjects()
      this.props.dispatch(setProjectsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchProjects = async () => {
    this.props.dispatch(setProjectsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setProjects(resp))
      },
      error => {
        this.props.dispatch(setProjectsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/`, this.props.token)
    this.props.dispatch(setProjectsLoading(false))
  }

  projectsRefresh = () => {
    this.props.dispatch(setProjectsFetch(true))
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            {this.props.projectsLoading ?
              <TabPane key="projects" tab="Projects">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
            :
              <TabPane key="projects" tab=<span>Projects<ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.projectsRefresh()}/></span>>
                <List/>
              </TabPane>
            }
          </Tabs>

        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,

  fortinetdbauth: state.authorizations.fortinetdb,

  projectsLoading: state.fortinetdb.projectsLoading,
  projects: state.fortinetdb.projects,
  projectsError: state.fortinetdb.projectsError,
  projectsFetch: state.fortinetdb.projectsFetch
}))(Projects);





/*
<React.Fragment>
  <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
    <Tabs type="card">
      { this.props.fortinetdbauth && (this.props.fortinetdbauth.assets_get || this.props.fortinetdbauth.any) ?
        <React.Fragment>
          {this.props.projectsLoading ?
            <TabPane key="Fortinetdb" tab="Fortinetdb">
              <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
            </TabPane>
            :
            <TabPane key="projects" tab=<span>Fortinetdb <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.projectsProjectsRefresh()}/></span>>
              <List/>
            </TabPane>
          }
        </React.Fragment>
        :
        null
      }

    </Tabs>

  </Space>
</React.Fragment>


*/
