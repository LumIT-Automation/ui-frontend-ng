import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setMonitorsList } from '../../_store/store.f5'

import { Button, Space, Modal, Col, Row, Spin, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/

class Delete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      monitorFullList: []
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

  details = () => {
    this.setState({visible: true})
  }


  deleteMonitor = async monitor => {
    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        //this.setState({loading: false, success: true})
        this.setState({loading: false, success: true}, () => this.fetchMonitors())
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${this.props.obj.type}/${this.props.obj.name}/`, this.props.token )
  }


  fetchMonitors =  () => {
    let list = ['tcp', 'tcp-half-open', 'http']
    list.forEach(type => {
      this.fetchMonitorsType(type)
    }
  )
    //this.props.dispatch(setMonitorsList(this.state.body.monitorFullList))
  }

  fetchMonitorsType = async (type) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.addToList(resp, type))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${type}/`, this.props.token)
  }

  addToList = (resp, type) => {
    let mon = Object.assign([], resp.data.items);
    let newList = []
    let currentList = Object.assign([], this.state.monitorFullList);
    let l = []

    mon.forEach(m => {
      Object.assign(m, {type: type});
      l.push(m)
    })

    newList = currentList.concat(l);
    this.setState({monitorFullList: newList})
    this.props.dispatch(setMonitorsList(newList))
  }

  resetError = () => {
    this.setState({ error: null})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    return (
      <Space direction='vertical'>

        <Button type="primary" danger onClick={() => this.details()}>
          Delete Monitor
        </Button>


        <Modal
          title={<p style={{textAlign: 'center'}}>DELETE MONITOR</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={null}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={antIcon} style={{margin: '10% 48%'}}/> }
          {!this.state.loading && this.state.success &&
            <Result
               status="success"
               title="Deleted"
             />
          }
          {!this.state.loading && !this.state.success &&
            <div>
              <Row>
                <Col span={5} offset={10}>
                  <h2>Are you sure?</h2>
                </Col>
              </Row>
              <br/>
              <Row>
                <Col span={2} offset={10}>
                  <Button type="primary" onClick={() => this.deleteMonitor(this.props.obj)}>
                    YES
                  </Button>
                </Col>
                <Col span={2} offset={1}>
                  <Button type="primary" onClick={() => this.closeModal()}>
                    NO
                  </Button>
                </Col>
              </Row>
            </div>
          }

        </Modal>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors
}))(Delete);
