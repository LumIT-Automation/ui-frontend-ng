

class Validators {

  ipv4 = ipv4 => {
    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(ipv4)) {
      console.log('ip ok')
      return true
    }
    else {
      console.log('not ip')
      return false
    }
  }

  macAddress = mac => {
    const validMacAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

    if (validMacAddressRegex.test(mac)) {
      return true
    }
    else {
      return false
    }
  }

}

export default Validators
