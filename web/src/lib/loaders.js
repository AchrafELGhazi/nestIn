import apiRequest from './apiRequest';
import { defer } from 'react-router-dom';
export const singlePageLoader = async ({ request, params }) => {
  const id = params.id;
  const response = await apiRequest(`/post/${id}`);

  console.log(response.data);
  return response.data;
};

export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split('?')[1];
  const postPromise = apiRequest(`/post?${query}`).then(
    response => response.data
  );
  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const listPromise = apiRequest(`/user/my-list`).then(
    response => response.data
  );

  const savedPromise = apiRequest(`/user/my-saved`).then(
    response => response.data
  );

  const chatsPromise = apiRequest(`/chat`).then(
    response => response.data
  );

  return defer({
    listResponse: listPromise,
    savedResponse: savedPromise,
    chatResponse: chatsPromise,
  });
};

