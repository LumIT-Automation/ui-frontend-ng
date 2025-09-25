import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';
import { Modal, Alert, Input, Select, Button, Divider, Spin, Row, Col, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import CustomCard from '../../_components/card'

import {
  err
} from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

const spinIcon25 = <LoadingOutlined style={{ fontSize: 25 }} spin />;
const spinIcon50 = <LoadingOutlined style={{ fontSize: 50 }} spin />;

function Report(props) {
  let [visible, setVisible] = useState(false);
  let [errors, setErrors] = useState({});
  let [reportTypes] = useState(["report-knowledge-assessment", "report-training", "report-phishing"]);
  let [reportType, setReportType] = useState('');

  let [reports, setReports] = useState([]);
  let [report, setReport] = useState('');
  
  let [file, setFile] = useState('');
  let [fileName, setFileName] = useState('');
  let [size, setSize] = useState('');
  let [type, setType] = useState('');
  let [binaryString, setBinaryString] = useState('');
  
  let [reportsLoading, setReportsLoading] = useState(false);
  let [reportLoading, setReportLoading] = useState(false);
  let [reportTypeError, setReportTypeError] = useState(false);
  let [reportError, setReportError] = useState(false);
  let [mailFrom, setMailFrom] = useState('');
  let [mailFromError, setMailFromError] = useState(false);
  let [binaryStringError, setBinaryStringError] = useState(false);

  useEffect(() => {
    if (props.assetToken || props.asset) {
      setReportType('');
      setReports([]);
      setReport('');
    }
  }, [props.assetToken, props.asset]);

  useEffect(() => {
    if (reportType) {
      main();
    }
  }, [reportType]);


  let main = async () => {
    if (props.vendor && props.asset && reportType) {
      setReportsLoading(true);
      let data = await dataGet(reportType);
      if (data.status && data.status !== 200) {
        let error = Object.assign(data, {
          component: 'report',
          vendor: 'proofpoint',
          errorType: 'reportsError'
        });
        props.dispatch(err(error));
      } else {
        setReports(data.data.items);
      }
      setReportsLoading(false);
    }
  };

  let readFile = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = res => resolve(res.target.result);
      reader.onerror = err => reject(err);
      reader.readAsBinaryString(file);
    });
  };

  let set = async (key, value) => {
    if (key === 'reportType') {
      setReportType(value);
      setReportTypeError(false);
      setReport('');
      setReportError(false);
    }
    if (key === 'report') {
      setReport(value);
      setReportError(false);
    }
    if (key === 'mailFrom') {
      setMailFrom(value);
      setMailFromError(false);
    }
    if (key === 'upload') {
      if (value) {
        setFile(value);
        setFileName(value.name);
        setSize(value.size);
        setType(value.type);
        let binary = await readFile(value);
        setBinaryString(binary);
      } else {
        setBinaryString('');
      }
      setBinaryStringError(false);
    }
  };

  let validation = async () => {
    let errors = await validationCheck();
    if (errors === 0) {
      getReport();
    }
  };

  let validationCheck = async () => {
    let errors = 0;
    let validators = new Validators();

    if (!reportType) {
      ++errors;
      setReportTypeError(true);
    }
    if (!report) {
      ++errors;
      setReportError(true);
    }
    if (reportType === "report-phishing") {
      if (!mailFrom) {
        ++errors;
        setMailFromError(true);
      }
      if (!validators.mailAddress(mailFrom)) {
        ++errors;
        setMailFromError(true);
      }
      if (!binaryString) {
        ++errors;
        setBinaryStringError(true);
      }
    }

    return errors;
  };

  let getReport = async () => {
    setReportLoading(true);
    let data = await dataPut(report);
    if (data.status && data.status !== 200) {
      let error = Object.assign(data, {
        component: 'report',
        vendor: 'proofpoint',
        errorType: 'reportError'
      });
      props.dispatch(err(error));
    } else {
      try {
        data.blob().then((blob) => {
          let fileURL = window.URL.createObjectURL(blob);
          let link = document.createElement("a");
          link.title = report;
          link.href = fileURL;
          link.target = "_blank";
          link.click();
        });
      } catch (err) {
        console.error(err);
      }
    }
    setReportLoading(false);
  };

  let dataGet = async (resource) => {
    let r
    let endpoint = `${props.vendor}/${props.asset.id}/usecases/${resource}/`;
    let additionalHeaders = props.assetToken ? [{ 'X-User-Defined-Remote-API-Token': props.assetToken }] : null;

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    );
    await rest.doXHR(endpoint, props.token, null, additionalHeaders);
    return r
  };

  let dataPut = async (resource) => {
    let r
    let endpoint = `${props.vendor}/${props.asset.id}/usecases/${reportType}/`;
    let body = { data: {} };
    if (reportType === "report-phishing") {
      body.data.mailFrom = mailFrom;
      body.data.emailScreenshot = btoa(binaryString);
      body.data.campaignname = report;
    } else {
      body.data.assignmentname = report;
    }
    let additionalHeaders = props.assetToken ? [{ 'X-User-Defined-Remote-API-Token': props.assetToken }] : null;
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    );
    await rest.doXHR(endpoint, props.token, body, additionalHeaders);
    return r
  };

  //Close and Error
  //let \[\s*\w+\s*,\s*
  /*
  let \[ corrisponde alla stringa let [.
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
  \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
  ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
  \]\s*=\s*useState
  */
  let closeModal = () => {
    setVisible(false);
    setErrors({});
    setReports([]);
    setReportType('');
    setReport('');
    setFile('');
    setFileName('');
    setSize('');
    setType('');
    setBinaryString('');
    setReportsLoading(false);
    setReportLoading(false);
    setReportTypeError(false);
    setReportError(false);
    setMailFrom('');
    setMailFromError(false);
    setBinaryStringError(false);
  };

  let createElement = (element, key, choices) => {
    switch (element) {
      case 'button':
        return (
          <Button
            type="primary"
            disabled={!reportType || !report || reportLoading}
            onClick={validation}
          >
            Get Your Report
          </Button>
        );
      case 'input':
        return (
          <Input
            value={key === 'mailFrom' ? mailFrom : ''}
            style={mailFromError ? { borderColor: 'red', width: 200 } : { width: 200 }}
            onChange={(event) => set(key, event.target.value)}
          />
        );
      case 'upload':
        return (
          <>
            <Input
              type="file"
              style={binaryStringError ? { borderColor: 'red', width: 350 } : { width: 350 }}
              onChange={(e) => set('upload', e.target.files[0])}
            />
            <Card>
              <p>Name: {fileName}</p>
              <p>Type: {type}</p>
              <p>Size: {size} Bytes</p>
            </Card>
          </>
        );
      case 'select':
        return (
          <Select
            value={key === 'reportType' ? reportType : report}
            showSearch
            style={key === 'reportType' && reportTypeError ? { borderColor: 'red', width: '100%' } : { width: '100%' }}
            onSelect={(value) => set(key, value)}
          >
            {(key === 'reportType' ? reportTypes : reports).map((n, i) => (
              <Select.Option key={i} value={n}>
                {n}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  let errorsComponent = () => {
    if (props.error && props.error.component === 'report') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <>
      <CustomCard 
        props={{
          width: 200, 
          title: 'Generate report', 
          details: 'Generate report',
          color: '#1677FF',
          onClick: function () { setVisible(true) } 
        }}
      />
  
      <Modal
        title={<p style={{ textAlign: 'center' }}>{props.type}</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={null}
        onOk={() => setVisible(true)}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor='proofpoint' />
  
        <Divider />
  
        {(props.asset && props.asset.id) ? (
          <>
            {reportsLoading ? (
              <Spin indicator={spinIcon25} style={{ margin: 'auto 48%' }} />
            ) : (
              <>
                <br />
                <Row>
                  <Col span={3}>
                    <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Report Type:</p>
                  </Col>
                  <Col span={6}>
                    {createElement('select', 'reportType', 'reportTypes', '', '')}
                  </Col>
                </Row>
  
                {reportType === "report-phishing" && (
                  <>
                    <Row>
                      <Col span={3}>
                        <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Mail From:</p>
                      </Col>
                      <Col span={6}>
                        {createElement('input', 'mailFrom', '', '', '')}
                      </Col>
                    </Row>
  
                    <Row>
                      <Col span={3}>
                        <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Upload:</p>
                      </Col>
                      <Col span={6}>
                        {createElement('upload', 'upload', '', '', '')}
                      </Col>
                    </Row>
                    <br />
                  </>
                )}
  
                <Row>
                  <Col span={3}>
                    <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Report:</p>
                  </Col>
                  <Col span={6}>
                    {reportsLoading ? (
                      <Spin indicator={spinIcon25} style={{ margin: '0 50px', display: 'inline' }} />
                    ) : (
                      <>
                        {createElement('select', 'report', 'reports', '', '')}
                      </>
                    )}
                  </Col>
                </Row>
  
                <br />
                <Row>
                  <Col offset={3} span={3}>
                    {createElement('button', '', '', '', 'commit')}
                  </Col>
                </Row>
  
                <br />
  
                <Divider />
  
                {reportLoading && (
                  <Spin indicator={spinIcon50} style={{ margin: '0 48%', display: 'inline' }} />
                )}
              </>
            )}
          </>
        ) : (
          <Alert message="Asset not set" type="error" />
        )}
      </Modal>
  
      {errorsComponent()}
    </>
  );
  
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.proofpoint.asset,
  assetToken: state.proofpoint.assetToken,  
}))(Report);
