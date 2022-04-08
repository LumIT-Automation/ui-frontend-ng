import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { VectorMap } from '@south-paw/react-vector-maps'
import italyJSON from './italyJSON.json'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  regionesError,
  regioneError
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


const Map = props => {

  const style = {
    fill: '#a82b2b',
    outline: 'none',
  }

  const [hovered, setHovered] = useState('None')
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [regionesLoading, setRegionesLoading] = useState(false)
  const [regioneLoading, setRegioneLoading] = useState(false)
  const [regione, setRegione] = useState('None')
  const [regiones, setRegiones] = useState([])
  const [values, setValues] = useState()


  const regionesGet = async () => {
    setRegionesLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setRegiones(resp.data.items)
      },
      error => {
        props.dispatch(regionesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=regione`, props.token)
    setRegionesLoading(false)
  }

  useEffect(() => {
    regionesGet()
    setColors()
  }, [])

  const setRegionCount = region => {
    setCount(0)
    regiones.forEach( r => {
      if (r.regione === region) {
        if (r.COUNT) {
          setCount(r.COUNT)
        }
        else {
          setCount(0)
        }
      }
    })
  }

  //regionesGet()

  const fetchValues = async regione => {
    setRegioneLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setValues(resp.data.items)
      },
      error => {
        props.dispatch(regioneError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=regione&fval=${regione}`, props.token)
    setRegioneLoading(false)
  }

  const setColors = () => {
  }

  const hide = () => {
    setVisible(false)
    setRegione()
    setValues([])
  }

  const events = {
    onMouseEnter: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      target.attributes.fill.value = 'yellow'
    },
    onMouseLeave: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      target.attributes.fill.value = '#a82b2b'
    },
    onClick: ({ target }) => {
      setVisible(true)
      setRegione(target.attributes.name.value)
      fetchValues(target.attributes.name.value)
    }
  };


  return (
    <div style={style}>
      { regionesLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <div>
          <Row>
            <Col span={17}>
              <p>Region: {hovered && <code>{hovered}</code>}</p>
            </Col>
            <Col span={7}>
              <p>Devices: {count && <code>{count}</code>}</p>
            </Col>
          </Row>
          <VectorMap {...italyJSON} layerProps={events} />
          </div>
      }

        <Modal
          title={<p style={{textAlign: 'center'}}>{regione}</p>}
          centered
          destroyOnClose={true}
          visible={visible}
          footer={''}
          //onOk={() => this.setState({visible: true})}
          onCancel={hide}
          width={1500}
        >
          { regioneLoading ?
             <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
          :
            <React.Fragment>
              { values ?
                <List height={550} pagination={5} filteredDevices={values}/>
              :
                null
              }
            </React.Fragment>
          }
        </Modal>


      { props.regionesError ? <Error component={'Italia'} error={[props.regionesError]} visible={true} type={'regionesError'} /> : null }
      { props.regioneError ? <Error component={'Italia'} error={[props.regioneError]} visible={true} type={'regioneError'} /> : null }

    </div>
  );
}


//export default Map

export default connect((state) => ({
  token: state.authentication.token,
  regionesError: state.fortinetdb.regionesError,
  regioneError: state.fortinetdb.regioneError,
}))(Map);
