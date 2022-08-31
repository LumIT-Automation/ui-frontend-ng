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



class SearchRagioneSociale extends React.Component {

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
    console.log('fby', fby)
    console.log(accounts)
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
    console.log(vals)
    console.log(vals[0])
    console.log(vals[1])

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
    await rest.doXHR(`fortinetdb/projectsd/?fby=${vals[0]}&fval=${vals[1]}`, this.props.token)
    this.setState({projectsLoading: false})

  }

  hide = () => {
    this.setState({visible: false, input: '', fby: '', account: {}})
  }

  render() {
    console.log(this.state.account)
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
          <p style={{margin: '5vh 0 1vh 0 ', fontSize: '3vh'}}>Ricerca:</p>
        </Col>
      </Row>

      <Row>
        <Col offset={5} >
          <p style={{margin: '1vh 0 0 0', fontSize: '2vh', textAlign: 'center'}}>
            Inserisci i primi tre caratteri della ragione sociale o dell'account e seleziona il valore desiderato.
          </p>
          <p style={{margin: '0 0 0 0', fontSize: '2vh', textAlign: 'center'}}>
            Verrà visualizzato un elenco navigabile dei servizi erogati da cui ottenere informazioni quali:
          </p>
          <p style={{margin: '0 0 4vh 0', fontSize: '2vh', textAlign: 'center'}}>
            l’elenco dettagliato dei modelli e seriali di device o le reti oggetto di protezione del servizio
          </p>
        </Col>
      </Row>


      <Row>
        { this.props.accountsLoading ?
          <Col offset={10} span={1}>
            <Spin indicator={spinIcon} style={{display: 'inline'}}/>
          </Col>
        :
          <Col offset={8} span={6}>
            <React.Fragment>
              <Select
                placeholder=""
                style={{width: '100%'}}
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
          </Col>
        }
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

}))(SearchRagioneSociale);
