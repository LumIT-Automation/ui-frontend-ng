import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { VectorMap } from '@south-paw/react-vector-maps'
import italyJSON from './italyJSON.json'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


const Map = props => {

  const style = {
    fill: '#a82b2b',
    stroke: 'black',
  }

  const [hovered, setHovered] = useState('None')
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [regionesLoading, setRegionesLoading] = useState(false)
  const [regioneLoading, setRegioneLoading] = useState(false)
  const [regiones, setRegiones] = useState([])
  const [regione, setRegione] = useState('None')
  const [devices, setDevices] = useState()

  useEffect(async() => {
    setRegionesLoading(true)
    let rs = await regionesGet()
    if (rs.status && rs.status !== 200) {
      let error = Object.assign(rs, {
        component: 'italia',
        vendor: 'fortinetdb',
        errorType: 'regionesError'
      })
      props.dispatch(err(error))
      setRegionesLoading(false)
    }
    else {
      setColors(rs)
    }
  }, [])

  const regionesGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=regione`, props.token)
    return r
  }

  const setColors = (rs) => {
    let regioni = []
    rs.data.items.forEach((regione, i) => {
      let r = regione.regione
      let c = regione.COUNT
        if (c <= 50) {
          regione.color = '#FFCE03'
          regioni.push(regione)
        }
        else if (c > 50 && c <= 100) {
          regione.color = '#FD9A01'
          regioni.push(regione)
        }
        else if (c > 100 && c <= 200) {
          regione.color = '#FD6104'
          regioni.push(regione)
        }
        else if (c > 200 && c <= 500) {
          regione.color = '#F00505'
          regioni.push(regione)
        }
        else if (c > 500) {
          regione.color = '#821212'
          regioni.push(regione)
        }
    });
    italyJSON.layers.forEach((item, i) => {
      let l = regioni.find(element => {
        return element.regione === item.name
      });

      if (l && l.color) {
        item.fill = l.color
      }

    });
    setRegiones(regioni)
    setRegionesLoading(false)

  }

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
        setDevices(resp.data.items)
      },
      error => {
        error = Object.assign(error, {
          component: 'italia',
          vendor: 'fortinetdb',
          errorType: 'regioneError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=regione&fval=${regione}`, props.token)
    setRegioneLoading(false)
  }

  const hide = () => {
    setVisible(false)
    setRegione()
    setDevices([])
  }

  const events = {
    onMouseEnter: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      target.setAttribute('outline', 'yellow')
    },
    onMouseLeave: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      //target.setAttribute('fill', '#a82b2b')
    },
    onClick: ({ target }) => {
      setVisible(true)
      setRegione(target.attributes.name.value)
      fetchValues(target.attributes.name.value)
    }
  };

  let errors = () => {
    if (props.error && props.error.component === 'italia') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }


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
          maskClosable={false}
        >
          { regioneLoading ?
             <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
          :
            <React.Fragment>
              { devices ?
                <List height={550} pagination={5} filteredDevices={devices}/>
              :
                null
              }
            </React.Fragment>
          }
        </Modal>

        {errors()}  

    </div>
  );
}


//export default Map

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(Map);
