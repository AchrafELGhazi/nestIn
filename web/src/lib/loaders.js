import apiRequest from './apiRequest';

export const singlePageLoader = async ({ request, params }) => {
  const id = params.id;
  const response = await apiRequest(`/post/${id}`);

  console.log(response.data);
  return response.data;
};

export const listPageLoader = async ({ request, params }) => {
  console.log(request)
  const query = request.url.split("?")[1]
  const response = await apiRequest(`/post?${query}`);
  return response.data;
};
