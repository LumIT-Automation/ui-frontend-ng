import CONFIG from "../config";


class Rest {
  constructor(method, onSuccess, onError) {
    this.method = method;
    this.onSuccess = onSuccess; // callback.
    this.onError = onError; // callback.
  }


  async doXHR(resource, token = "", payload = null) {
    resource = encodeURI(resource)
    let json;

    if (resource) {
      if (resource === "login") {
        if (this.method === "POST") {
          try {
            const response = await fetch(CONFIG.AUTH_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (response.ok) {

              json = await response.json();
              if (json && json.access) {
                this.onSuccess(json);
              }
              else {
                this.onError("No access token received.");
              }
            }
            else {
              if (response.status === 401)
                this.onError({
                  message: "Wrong username or password."
                });
              else
              this.onError({
                message: "HTTP " + response.status + " received."
              });
                //this.onError("HTTP " + response.status + " received.");
            }
          }

          catch (error) {
            this.onError(error);
          }
        }
      }

      if (resource === "superadmins") {
        if (this.method === "GET") {
          try {
            const response = await fetch(CONFIG.SUPERADMIN_URL, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            })

            if (response.ok) {
              // HTTP-status is 200-299.
              json = await response.json();
              if (json && json.data) {
                this.onSuccess(json);
              }
              else {
                this.onError(
                  {
                    message: "No data received"
                  }
                )
              }
            }
            else {
              this.onError(
                {
                  status: response.status,
                  message: response.statusText,
                  type: response.type,
                  url: response.url
                }
              )
            }
          }

          catch (error) {
            this.onError(
              {
                message: error.statusText,
                name: error.name,
                type: error.name
              }
            )
          }
        }
      }

      else {
        if (this.method === "GET") {
          try {

            let headers = {}

            if (token) {
              headers = {
                'Authorization': 'Bearer ' + token
              }
            }

            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'GET',
              headers: headers
            })

            if (response.ok) {
              let content = response.headers.get('content-type')
              console.log(content)
              if (content === 'application/json') {
                json = await response.json();
              }
              
              if (json && json.data) {
                this.onSuccess(json);
              }
              else {
                this.onSuccess(response);
              }
            }
            else {
              try {
                json = await response.json();
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    reason: json.reason,
                    type: response.type,
                    url: response.url
                  }
                )
              }
              catch {
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  }
                )
              }
            }
          }
          catch (error) {
            console.log('error')
            this.onError({
              message: error.message,
              type: error.name
            });
          }
        }

        else if (this.method === "POST") {
          if (resource === 'login') {
            return
          }
          try {
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            })

            if (response.ok) {
              try {
                json = await response.json();

                if (json && json.data) {
                  this.onSuccess(json);
                }
                else {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
              }
              catch (error) {
                if (error instanceof SyntaxError && error.message.toLowerCase().includes('json')) {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
                else {
                  this.onError({
                      status: response.status,
                      message: response.statusText,
                      type: response.type,
                      url: response.url
                    })
                }

              }

            }
            else {
              try {
                json = await response.json();
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    reason: json.reason,
                    type: response.type,
                    url: response.url
                  }
                )
              }
              catch {
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  }
                )
              }
            }
          }
          catch (error) {
            this.onError({
              message: error.message,
              type: error.name
            });
          }
        }

        else if (this.method === "PATCH") {
          try {
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'PATCH',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            })

            if (response.ok) {
              try {
                json = await response.json();

                if (json && json.data) {
                  this.onSuccess(json);
                }
                else {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
              }
              catch (error) {
                if (error instanceof SyntaxError && error.message.toLowerCase().includes('json')) {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
                else {
                  this.onError({
                      status: response.status,
                      message: response.statusText,
                      type: response.type,
                      url: response.url
                    })
                }

              }

            }
            else {
              try {
                json = await response.json();
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    reason: json.reason,
                    type: response.type,
                    url: response.url
                  }
                )
              }
              catch {
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  }
                )
              }
            }
          }
          catch (error) {
            this.onError({
              message: error.message,
              type: error.name
            });
          }
        }

        else if (this.method === "PUT") {
          try {
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            })

            if (response.ok) {
              try {
                json = await response.json();

                if (json && json.data) {
                  this.onSuccess(json);
                }
                else {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
              }
              catch (error) {
                if (error instanceof SyntaxError && error.message.toLowerCase().includes('json')) {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
                else {
                  this.onError({
                      status: response.status,
                      message: response.statusText,
                      type: response.type,
                      url: response.url
                    })
                }

              }

            }
            else {
              try {
                json = await response.json();
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    reason: json.reason,
                    type: response.type,
                    url: response.url
                  }
                )
              }
              catch (error) {
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  }
                )
              }
            }
          }
          catch (error) {
            this.onError({
              message: error.message,
              type: error.name
            });
          }
        }

        else if (this.method === "DELETE") {
          try {
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'DELETE',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            })

            if (response.ok) {
              try {
                json = await response.json();

                if (json && json.data) {
                  this.onSuccess(json);
                }
                else {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
              }
              catch (error) {
                if (error instanceof SyntaxError && error.message.toLowerCase().includes('json')) {
                  this.onSuccess({
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  });
                }
                else {
                  this.onError({
                      status: response.status,
                      message: response.statusText,
                      type: response.type,
                      url: response.url
                    })
                }

              }

            }
            else {
              try {
                json = await response.json();
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    reason: json.reason,
                    type: response.type,
                    url: response.url
                  }
                )
              }
              catch {
                this.onError(
                  {
                    status: response.status,
                    message: response.statusText,
                    type: response.type,
                    url: response.url
                  }
                )
              }
            }
          }
          catch (error) {
            this.onError({
              message: error.message,
              type: error.name
            });
          }
        }
      }
    }

    // No HTTP method specified.
    else {
      this.onError("No HTTP method specified");
    }
  }
}

export default Rest;
