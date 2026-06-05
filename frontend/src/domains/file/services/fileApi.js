const BASE_URL = "http://localhost:8080/api";

export async function uploadFile(accessToken, fileData, refType) {
  return await fetch(`${BASE_URL}/files/upload?refType=${refType}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: fileData,
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}

export async function getFile(accessToken, refType, refId) {
  return await fetch(`${BASE_URL}/files?refType=${refType}&refId=${refId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}

export async function deleteFiles(accessToken, id) {
  return await fetch(`${BASE_URL}/files?${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}
