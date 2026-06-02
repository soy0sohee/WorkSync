const BASE_URL = "http://localhost:8080/api";

export async function uploadFile(accessToken, fileData) {
  return await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ files }),
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
