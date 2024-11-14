import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import CommonFunctions from '../../_helpers/commonFunctions'
import { err } from '../../concerto/store';

import { Modal, Row, Col, Divider, Input, Button, Spin, Table, Space, Radio, Select } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function CloudAccount(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false)
  let [accounts, setAccounts] = useState([])
  let [account, setAccount] = useState({})
  let [providers, setProviders] = useState(['AWS'])
  let [provider, setProvider] = useState('')

  useEffect(() => {
    if (provider) {
      getAccounts()
    }
  }, [provider]);


  let getAccounts = async () => {
    setLoading(true);
    try {
      let data = await dataGet('workflow/cloud-accounts/');
      if (data.status && data.status !== 200) {
        let error = Object.assign(data, {
          component: 'CloudAccount',
          vendor: 'workflow',
          errorType: 'accountsError',
        });
        props.dispatch(err(error));
        return;
      } else {
        setAccounts(data.data.items)
      }
    } catch (error) {
      console.log('main error', error);
    }
    setLoading(false);
  };


  let dataGet = async (endpoint) => {
    let r;
    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(`${endpoint}`, props.token);
    return r;
  };

  let set = async (key, value) => {
    if (key === 'Account Name') {
      let acc = accounts.find( a => a['Account Name'] === value )
      setAccount(acc)
    }
  }

  //Close and Error
  //const \[\s*\w+\s*,\s*
  /*
  const \[ corrisponde alla stringa const [.
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
  \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
  ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
  */
  let closeModal = () => {
    setVisible(false);
  };

  let errorComponent = () => {
    if (props.error && props.error.component === 'CloudAccount') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  return (
    <React.Fragment>

      <Button type="primary" onClick={() => setVisible(true)}>CLOUD ACCOUNT</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>CLOUD ACCOUNT</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >
        <Row>
          <Col span={3}>
            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Provider:</p>
          </Col>
          <Col span={3}>
            <Select
              value={provider}
              showSearch
              style={{width: 180}}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => setProvider(event)}
            >
              <React.Fragment>
                {providers.map((p,i) => {
                  return (
                    <Select.Option key={i} value={p}>{p}</Select.Option>
                  )
                  })
                }
              </React.Fragment>
            </Select>
          </Col>
        </Row>

        <Divider/>
        {provider ?
          loading ?
            <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
          :
            <Row >
              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
              </Col>
              <Col span={3}>
                <Select
                  value={account['Account Name']}
                  showSearch
                  style={{width: 180}}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onSelect={event => set('Account Name', event)}
                >
                  <React.Fragment>
                    {accounts && accounts.length > 0 ? accounts.map((a,i) => {
                      console.log(a)
                      return (
                        <Select.Option key={i} value={a['Account Name']}>{a['Account Name']}</Select.Option>
                      )
                      })
                    :
                    null
                    }
                  </React.Fragment>
                </Select>
              </Col>

              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID:</p>
              </Col>
              <Col span={3}>
                <Input
                  disabled
                  value={account ? account['Account ID']: null}
                >
                </Input>
              </Col>

              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Reference:</p>
              </Col>
              <Col span={3}>
                <Input
                  disabled
                  value={account ? account['Reference']: null}
                >
                </Input>
              </Col>

              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Country:</p>
              </Col>
              <Col span={3}>
                <Input
                  disabled
                  value={account ? account['Country']: null}
                >
                </Input>
              </Col>

            </Row>
        :
          null
        }
      </Modal>

    {visible ?
      <React.Fragment>
        {errorComponent()}
      </React.Fragment>
    :
      null
    }

    </React.Fragment>
  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(CloudAccount);