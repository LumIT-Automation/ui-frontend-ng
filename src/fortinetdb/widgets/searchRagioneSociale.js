import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  projects,
  projectsLoading,
  projectsError,
  project,
  projectError,

} from '../store'

import List from '../projects/list'

import { Modal, Spin, Row, Col, Select, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class SearchRagioneSociale extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.projectsGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  projectsGet = async () => {
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

  filteredProjectsGet = async () => {
    this.setState({projectLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({projects: resp.data.items})
      },
      error => {
        this.props.dispatch(projectError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fby=RAGIONE_SOCIALE&fval=${this.state.project}`, this.props.token)
    this.setState({projectLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <Row>
        <Col offset={8} span={8}>
          { this.props.projectsLoading ?
            <React.Fragment>
              <p style={{margin: '5vh 0', fontSize: '3vh'}}>Ragione sociale: </p>
              <Spin indicator={spinIcon} style={{margin: '0 5vw', display: 'inline'}}/>
            </React.Fragment>
          :
            <React.Fragment>
              <p style={{margin: '5vh 0 0 0', fontSize: '3vh'}}>Ragione sociale: </p>
              <Select
                style={{width: '50vw'}}
                showSearch
                //allowClear
                value={this.state.project}
                onSearch={a => this.setState({input: a})}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (option.value !== null && input.length > 4) {
                    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                }
                }
                filterSort={(optionA, optionB) => {
                    return optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                }
                //onClick={e => this.setState({visible: true, project: e}, () => this.filteredProjectsGet())}
                onSelect={
                  e => {
                    if (e === this.state.project) {
                      this.setState({visible: true, project: e}, () => this.filteredProjectsGet())
                    }
                  }
                }
                onChange={e => this.setState({visible: true, project: e}, () => this.filteredProjectsGet())}>
                {(this.state.input && this.state.input.length) > 4 ?
                  <React.Fragment>
                    {this.props.projects && this.props.projects.map((n, i) => {
                        return (
                          <Select.Option key={i} value={n.RAGIONE_SOCIALE}>{n.RAGIONE_SOCIALE}</Select.Option>
                        )

                      })
                    }
                  </React.Fragment>
                :
                  null
                }
              </Select>
            </React.Fragment>
          }
          { this.state.visible ?
            <React.Fragment>
              <Modal
                title={<p style={{textAlign: 'center'}}>{this.state.project}</p>}
                centered
                destroyOnClose={true}
                visible={this.state.visible}
                footer={''}
                //onOk={() => this.setState({visible: true})}
                onCancel={this.hide}
                width={1500}
              >
                { this.state.projectLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                  <React.Fragment>
                    { this.state.projects ?
                      <List height={550} pagination={5} filteredProjects={this.state.projects}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>
              { this.props.projectError ? <Error component={'Project'} error={[this.props.projectError]} visible={true} type={'projectError'} /> : null }
            </React.Fragment>
          :
            null
          }
        </Col>
      </Row>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  projects: state.fortinetdb.projects,
  projectsLoading: state.fortinetdb.projectsLoading,
  projectsError: state.fortinetdb.projectsError,

  project: state.fortinetdb.project,
  projectError: state.fortinetdb.projectError,

}))(SearchRagioneSociale);
