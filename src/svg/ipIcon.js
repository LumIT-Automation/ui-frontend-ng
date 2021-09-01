import * as React from 'react'

function IconFont(props: React.SVGProps<SVGSVGElement>) {
  return(
    <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="23.333" y="23.333" width="13.334" height="6.667"/>
    <rect x="43.333" y="23.333" width="33.334" height="6.667"/>
    <rect x="23.333" y="36.667" width="30" height="6.667"/>
    <rect x="23.333" y="50" width="20" height="6.666"/>
    <path d="M83.333,10H16.667C13.001,10,10,13,10,16.667v46.667C10,66.999,13.001,70,16.667,70h35.149
    	c1.172,1.989,2.849,3.652,4.851,4.817V90l6.666-3.333L70,90V74.817c2.002-1.165,3.679-2.828,4.851-4.817h8.482
    	C86.999,70,90,66.999,90,63.334V16.667C90,13,86.999,10,83.333,10z M63.333,70c-3.682,0-6.666-2.985-6.666-6.666
    	c0-3.682,2.984-6.668,6.666-6.668S70,59.652,70,63.334C70,67.015,67.015,70,63.333,70z M83.333,63.334h-6.666
    	C76.667,55.971,70.69,50,63.333,50C55.977,50,50,55.971,50,63.334H16.667V16.667h66.666V63.334z"/>
    </svg>

  )
}

export default IconFont

/*
import IpSVG from '../svg/ip-address-svgrepo-com.svg'

function IpIcon(props) {
  return (
    //<img src={IpSVG} style={{display: "inline-block"}} width="20" height="20" alt="IpSVG"/>

    <svg
      width={48}
      height={1}
      viewBox="0 0 48 1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{"Rectangle 5"}</title>
      <path d="M0 0h48v1H0z" fill="#063855" fillRule="evenodd" />
    </svg>

  )
}
*/
