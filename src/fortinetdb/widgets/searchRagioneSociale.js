import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'
import LogoFW from '../../svg/logo-compatto.png'

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

import { Modal, Spin, Row, Col, Select, Divider, Image } from 'antd'
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
    this.setState({visible: false, input: ''})
  }

  render() {
    return (
      <React.Fragment>
      {/*
      <Row>
        <Col offset={8} span={8}>
          <Image
            preview={false}
            src={LogoFW}
            width={'100%'}
            style={{marginTop: '7px'}}
          />
        </Col>
      </Row>
      */}
      <Row>
        <Col offset={10} span={8}>
          <p style={{margin: '5vh 0 1vh 0 ', fontSize: '3vh'}}>Ragione sociale: </p>
        </Col>
      </Row>

      <Row>
        { this.props.projectsLoading ?
          <Col offset={11} span={1}>
            <Spin indicator={spinIcon} style={{display: 'inline'}}/>
          </Col>
        :
          <Col offset={5} span={8}>
            <React.Fragment>
              <Select
                placeholder="Inseriti i primi cinque caratteri della ragione sociale e selezionato il cliente desiderato verrà visualizzato un elenco navigabile dei servizi erogati"
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
          </Col>
        }
      </Row>

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
      </React.Fragment>
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
