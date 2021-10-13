import CONFIG from "../config";


class Rest {
  constructor(method, onSuccess, onError) {
    this.method = method;
    this.onSuccess = onSuccess; // callback.
    this.onError = onError; // callback.
  }


  async doXHR(resource, token = "", payload = null) {
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
              // HTTP-status is 200-299.
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
                this.onError("Wrong username or password.");
              else
                this.onError("HTTP " + response.status + " received.");
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
                message: error.message,
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
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
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
              json = await response.json();

              this.onError(
                {
                  status: response.status,
                  message: response.statusText,
                  reason: (json) ? json.error.API.error.F5 : null,
                  type: response.type,
                  url: response.url
                }
              )
            }
          }

          catch (error) {
            this.onError(
              {
                message: error.message,
                name: error.name,
                type: error.name
              }
            )
          }
        }

        else if (this.method === "POST") {
          //let json;

          try {
            const response = await fetch(CONFIG.BACKEND_URL + resource, {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (response.ok) {
              // HTTP-status is 200-299.
              json = await response.json();
              if (json && json.data) {
                this.onSuccess(json);
              }
              else {
                this.onSuccess(response);
              }
            }
            else {
              json = await response.json();
              //this.onError("HTTP " + response.status + " received.");

              this.onError(
                {
                  status: response.status,
                  message: response.statusText,
                  reason: json.error.API.error.F5.message,
                  type: response.type,
                  url: response.url
                }
              )
            }
          }

          catch (error) {
            this.onError(
              {
                message: error.message,
                name: error.name,
                type: error.name
              }
            )
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
            });

            if (response.ok) {
              // HTTP-status is 200-299
              this.onSuccess(response);
            }
            else {
              this.onError(
                {
                  status: response.status,
                  message: response.statusText,
                  type: response.type,
                  url: response.url,
                  body: response.body,
                  trailers: response.trailers
                }
              );
            }
          }

          catch (error) {
            this.onError(
              {
                message: error.message,
                name: error.name,
                type: error.name
              }
            )
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
            });

            if (response.ok) {
              // HTTP-status is 200-299.
              this.onSuccess(response);
            }
            else {
              this.onError(
                {
                  status: response.status,
                  message: response.statusText,
                  type: response.type,
                  url: response.url,
                  body: response.body,
                  trailers: response.trailers
                }
              );
            }
          }

          catch (error) {
            this.onError(
              {
                message: error.message,
                name: error.name,
                type: error.name
              }
            )
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
