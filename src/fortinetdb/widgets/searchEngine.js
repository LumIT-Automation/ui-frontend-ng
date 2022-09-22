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

  accounts,
  accountsLoading,
  accountsError,
  account,
  accountError,

} from '../store'

import List from '../projects/list'

import { Modal, Spin, Row, Col, Select, Divider, Image } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class SearchEngine extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.accountsGet()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  accountsGet = async () => {
    this.props.dispatch(accountsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(accounts(resp))
        this.searchingListSet(resp.data.items)
      },
      error => {
        this.props.dispatch(accountsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/accounts/`, this.props.token)
    this.props.dispatch(accountsLoading(false))
  }

  searchingListSet = async list => {
    let newList = []
    list.forEach((item, i) => {
      if (item.ACCOUNT) {
        newList.push(item.ACCOUNT)
      }
      if (item.RAGIONE_SOCIALE){
        newList.push(item.RAGIONE_SOCIALE)
      }
    });
    await this.setState({searchingList: newList})
  }

  fiteredBy = async fby => {
    let accounts = JSON.parse(JSON.stringify(this.props.accounts))
    await this.setState({fby: fby})
    let o = {}
    accounts.forEach((item, i) => {
      if (item.ACCOUNT === fby) {
        o.ACCOUNT = fby
        this.setState({account: item})
      }
      if (item.RAGIONE_SOCIALE === fby) {
        o.RAGIONE_SOCIALE = fby
        this.setState({account: item})
      }
    });
    this.filteredProjectsGet(o)
  }

  filteredProjectsGet = async o => {
    let vals
    vals = Object.entries(o)
    vals = vals[0]

    this.setState({projectsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({projects: resp.data.items, visible: true})
      },
      error => {
        this.props.dispatch(projectsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/?fby=${vals[0]}&fval=${vals[1]}`, this.props.token)
    this.setState({projectsLoading: false})

  }

  hide = () => {
    this.setState({visible: false, input: '', fby: '', account: {}})
  }

  render() {
    console.log(this.state.account)
    const Logo = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={'200px'}
        //width={'64px'}
        />
      }
    return (
      <React.Fragment>
      <Row>
        <Col offset={5} xs={6} sm={6} md={6} lg={6} xl={4} xxl={4} style={{marginTop: '14vh'}}>
          <Logo data={this.props.image}/>
        </Col>
        <Col offset={1} xl={8} xxl={8}>
          <Row>
            <p style={{margin: '13vh 40% 0 40%', fontSize: '3vh', textAlign: 'center'}}>Ricerca</p>
          </Row>

          <Row>
              <p style={{margin: '3vh 4vh 0 0'}}>
                Inserisci i primi tre caratteri della ragione sociale o dell'account e seleziona il valore desiderato.
                Verrà visualizzato un elenco navigabile dei servizi erogati da cui ottenere informazioni quali:
                l’elenco dettagliato dei modelli e seriali di device o le reti oggetto di protezione del servizio
              </p>
          </Row>
          <Row>
            { this.props.accountsLoading ?
              <Spin indicator={spinIcon} style={{margin: '5vh 5vh 0 0', display: 'inline'}}/>
            :
              <React.Fragment>
                <Select
                  placeholder=""
                  style={{width: '100%', margin: '5vh 5vh 0 0'}}
                  showSearch
                  //allowClear
                  value={this.state.fby}
                  onSearch={a => this.setState({input: a})}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if (option.value !== null && input.length > 2) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  }
                  }
                  filterSort={(optionA, optionB) => {
                      return optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                  }
                  onSelect={e => this.fiteredBy(e)}>
                  //onChange={e => this.fiteredBy(e)}>
                  {(this.state.input && this.state.input.length) > 2 ?
                    <React.Fragment>
                      {this.state.searchingList && this.state.searchingList.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
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
          </Row>
        </Col>

      </Row>

        { this.state.visible ?
          <React.Fragment>
            <Modal
              title={<p style={{textAlign: 'center'}}>{this.state.account ? this.state.account.RAGIONE_SOCIALE : null}</p>}
              centered
              destroyOnClose={true}
              visible={this.state.visible}
              footer={''}
              //onOk={() => this.setState({visible: true})}
              onCancel={this.hide}
              width={1500}
            >
              { this.state.projectsLoading ?
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

          </React.Fragment>
        :
          null
        }
        { this.props.accountsError ? <Error component={'SearchEngine'} error={[this.props.accountsError]} visible={true} type={'accountsError'} /> : null }
        { this.props.projectsError ? <Error component={'Project'} error={[this.props.projectsError]} visible={true} type={'projectsError'} /> : null }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
  image: state.authentication.image,

  projects: state.fortinetdb.projects,
  projectsLoading: state.fortinetdb.projectsLoading,
  projectsError: state.fortinetdb.projectsError,

  project: state.fortinetdb.project,
  projectError: state.fortinetdb.projectError,

  accounts: state.fortinetdb.accounts,
  accountsLoading: state.fortinetdb.accountsLoading,
  accountsError: state.fortinetdb.accountsError,

  account: state.fortinetdb.account,
  accountError: state.fortinetdb.accountError,

}))(SearchEngine);
