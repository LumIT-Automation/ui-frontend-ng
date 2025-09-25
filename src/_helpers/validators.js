let Netmask = require('netmask').Netmask  //https://www.npmjs.com/package/netmask

class Validators {

  ipv4 = ipv4 => {
    try {
      const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    
      if (!ipv4) {
        return false
      }

      if (ipv4.includes('%')) {
        ipv4 = ipv4.split('%')
        ipv4 = ipv4[0] 
      }
      if (validIpAddressRegex.test(ipv4)) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  ipv6 = ipv6 => {
    try {
      const validIpAddressRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

      if (!ipv6) {
        return false
      }

      if (validIpAddressRegex.test(ipv6)) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  macAddress = mac => {
    try {
      const validMacAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

      if (!mac) {
        return false
      }

      if (validMacAddressRegex.test(mac)) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  port = port => {
    try {
      if (!port) {
        return false
      }
  
      if (port !== '' && !isNaN(port) && port >= 0 && port < 65536) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  mask_length4 = mask_length4 => {
    try {
      if (!mask_length4) {
        return false
      }
  
      if (!isNaN(mask_length4) && mask_length4 >= 0 && mask_length4 <= 32) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
  }

  mask_length6 = mask_length6 => {
    try {
      if (!mask_length6) {
        return false
      }
  
      if (!isNaN(mask_length6) && mask_length6 >= 1 && mask_length6 <= 128) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  fqdn = fqdn => {
    try {
      if (!fqdn) {
        return false
      }
  
      const validFqdnRegex = /^((\*|[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
  
      if (validFqdnRegex.test(fqdn)) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  isSubnet = (subnet) => {
    try {
      if (!subnet) {
        return false
      }
  
      let block
  
      try {
        block = new Netmask(subnet)
        return true
  
      } catch(error) {
        console.error(error)
      }
  
      return false
    } catch (error) {
      console.error(error)
    }
    
  }

  ipInSubnet = (subnet, ips) => {
    try {
      if (!subnet) {
        return false
      }
  
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
    } catch (error) {
      console.error(error)
    }
    
  }

  mailAddress = (email) => {
    try {
      if (!email) {
        return false
      }
  
      return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    } catch (error) {
      console.error(error)
    }
    
  }

}

export default Validators
