const BASE_URL = "http://localhost:8080/api";

// 게시판 목록 조회 (카테고리 드롭다운용)
export async function getBoards(accessToken) {
  return await fetch(`${BASE_URL}/boards`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return json.data;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}

//게시글 목록 조회
export async function getPosts(boardId, accessToken) {
  return await fetch(`${BASE_URL}/boards/${boardId}/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return json.data?.content ?? [];
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}
// 게시글 등록
export async function getCreatePosts(boardId, data, accessToken) {
  return await fetch(`${BASE_URL}/boards/${boardId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return json.data;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}

//게시글 상세 조회
export async function getPostById(boardId, postId, accessToken) {
  return await fetch(`${BASE_URL}/boards/${boardId}/posts/${postId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return json.data;
    })
    .catch((error) => {
      console.log("에러발생: " + error);
    });
}
