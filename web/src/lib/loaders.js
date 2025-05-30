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