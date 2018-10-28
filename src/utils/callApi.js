export function callAPI(method, url, path, data) {
    return fetch(url + path, {
      method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  }