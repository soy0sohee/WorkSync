const BASE_URL = "http://localhost:8080/api";

export async function getMyInfo(accessToken) {
  return await fetch(`${BASE_URL}/employees/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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
