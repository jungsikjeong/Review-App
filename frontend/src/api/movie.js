import client from './client';

export const uploadTrailer = async (formData, onUploadProgress) => {
  const token = localStorage.getItem('auth-token');
  try {
    const { data } = await client.post('/movie/upload-trailer', formData, {
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'multipart/form-data',
      },
      onUploadProgress: ({ loaded, total }) => {
        // progressEvent.loaded는 현재까지 로드된 수치를,
        // progressEvent.total는 전체 수치를 나타냄
        if (onUploadProgress)
          onUploadProgress(Math.floor((loaded / total) * 100));
      },
    });

    return data;
  } catch (error) {
    const { response } = error;
    if (response?.data) return response.data;

    return { error: error.message || error };
  }
};
