let Netmask = require('netmask').Netmask  //https://www.npmjs.com/package/netmask

class Validators {

  ipv4 = ipv4 => {
    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(ipv4)) {
      return true
    }
    else {
      return false
    }
  }

  ipv6 = ipv6 => {
    const validIpAddressRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

    if (validIpAddressRegex.test(ipv6)) {
      return true
    }
    else {
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

  port = port => {
    if (port !== '' && !isNaN(port) && port >= 0 && port < 65536) {
      return true
    }
    else {
      return false
    }
  }

  mask_length4 = mask_length4 => {
    if (!isNaN(mask_length4) && mask_length4 >= 0 && mask_length4 <= 32) {
      return true
    }
    else {
      return false
    }
  }

  mask_length6 = mask_length6 => {
    if (!isNaN(mask_length6) && mask_length6 >= 1 && mask_length6 <= 128) {
      return true
    }
    else {
      return false
    }
  }

  fqdn = fqdn => {
    const validFqdnRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

    if (!fqdn) {
      return false
    }

    if (validFqdnRegex.test(fqdn)) {
      return true
    }
    else {
      return false
    }
  }

  isSubnet = (subnet) => {
    let block

    try {
      block = new Netmask(subnet)
      return true

    } catch(error) {
      console.log(error)
    }

    return false
  }

  ipInSubnet = (subnet, ips) => {
    if (subnet.includes('%')) {
      let sub = subnet.split('%')
      let m = sub[1]
      let mask = m.split('/')
      subnet = `${sub[0]}/${mask[1]}`
    }

    let block = new Netmask(subnet)
    let ok = 1

    ips.forEach((ip, i) => {
      if (block.contains(ip)) {
        ok *= 1
      }
      else {
        ok *= 0
      }
    });

    if (ok) {
      return true
    }
    else {
      return false
    }
  }

  mailAddress = (email) => {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

}

export default Validators
