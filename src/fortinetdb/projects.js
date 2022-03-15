import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import Rest from '../_helpers/Rest'
import Error from './error'

import { projects, projectsLoading, projectsError, projectsFetch } from './store'

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
    if (!this.props.projects || this.props.projects.length === 0) {
      this.fetchProjects()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.projectsFetch) {
      this.fetchProjects()
      this.props.dispatch(projectsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchProjects = async () => {
    this.props.dispatch(projectsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(projects(resp))
      },
      error => {
        this.props.dispatch(projectsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/`, this.props.token)
    this.props.dispatch(projectsLoading(false))
  }

  projectsRefresh = () => {
    this.props.dispatch(projectsFetch(true))
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

          { this.props.projectsError ? <Error component={'fortinetdb projects'} error={[this.props.projectsError]} visible={true} type={'projectsError'} /> : null }

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,

  fortinetdbauth: state.authorizations.fortinetdb,

  projectsLoading: state.fortinetdb.projectsLoading,
  projects: state.fortinetdb.projects,
  projectsError: state.fortinetdb.projectsError,
  projectsFetch: state.fortinetdb.projectsFetch
}))(Projects);
