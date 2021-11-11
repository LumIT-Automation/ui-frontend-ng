import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { VectorMap } from '@south-paw/react-vector-maps';
import italy from './italy.json';



const Map =() => {
  const style = { margin: '1rem auto', fill: '#a82b2b', outline: 'none' };

  const [hovered, setHovered] = React.useState('None');
  const [focused, setFocused] = React.useState('None');
  const [clicked, setClicked] = React.useState('None');

  const layerProps = {
    onMouseEnter: ({ target }) => setHovered(target.attributes.name.value),
    onMouseLeave: ({ target }) => setHovered('None'),
    onFocus: ({ target }) => setFocused(target.attributes.name.value),
    onBlur: ({ target }) => setFocused('None'),
    onClick: ({ target }) => {
      const name = target.attributes.name.value;
      window.open(`https://www.google.com/search?q=${name}`)
    }
  };



  return (
    <div style={style}>
      <VectorMap {...italy} layerProps={layerProps} />
      <hr />
      <p>Hovered: {hovered && <code>{hovered}</code>}</p>
      <p>Focused: {focused && <code>{focused}</code>}</p>
      <p>Clicked: {clicked && <code>{clicked}</code>}</p>
    </div>
  );
}


export default Map
