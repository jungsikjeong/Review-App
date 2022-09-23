import React from 'react';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { uploadTrailer } from '../../api/movie';
import { useNotification } from '../../hooks';
import MovieForm from './MovieForm';

const MovieUpload = () => {
  const [videoSelected, setVideoSelected] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState({});
  const [movieInfo, setMovieInfo] = useState({
    title: '',
    cast: [],
    director: {},
    writers: [],
    releaseDate: '',
    poster: null,
    genres: [],
    type: '',
    language: '',
    status: '',
    trailer: {
      url: '',
      public_id: '',
    },
  });

  const { updateNotification } = useNotification();

  const handleTypeError = (error) => {
    updateNotification('error', error);
  };

  const handleUploadTrailer = async (data) => {
    const { error, url, public_id } = await uploadTrailer(
      data,
      setUploadProgress
    );

    if (error) return updateNotification('error', error);

    setVideoUploaded(true);
    setVideoInfo({ url, public_id });
  };

  const handleChange = (file) => {
    // new FormData는 api통신을 할때 서버에 Body:form-data양식으로 보낼 수 있게 해줌
    // new FormData로 api통신에 성공시, 페이지 새로고침이 없음
    // 파일이나 이미지 비디오 등등에 주로 사용됨
    const formData = new FormData();

    formData.append('video', file);

    setVideoSelected(true);

    handleUploadTrailer(formData);
  };

  const getUploadProgressValue = () => {
    if (!videoUploaded && uploadProgress >= 100) {
      return `처리 중..`;
    }
    return `업로드 진행률 ${uploadProgress}`;
  };

  return (
    <div
      className='fixed inset-0 dark:bg-white dark:bg-opacity-50 bg-primary bg-opacity-50
    backdrop-blur-sm flex items-center justify-center'
    >
      <div
        className='dark:bg-primary bg-white rounded w-[45rem] h-[40rem]
        overflow-auto p-2'
      >
        {/* 로딩창 */}
        {/* <UploadProgress
          visible={!videoUploaded && videoSelected}
          message={getUploadProgressValue()}
          width={uploadProgress}
        />

        <TrailerSelector
          visible={!videoSelected}
          handleChange={handleChange}
          onTypeError={handleTypeError}
        /> */}

        <MovieForm />
      </div>
    </div>
  );
};

const TrailerSelector = ({ visible, handleChange, onTypeError }) => {
  if (!visible) return null;

  return (
    <div className='h-full flex items-center justify-center'>
      <FileUploader
        handleChange={handleChange}
        onTypeError={onTypeError}
        types={['mp4', 'avi']}
      >
        <div
          className='w-48 h-48 border border-dashed dark:border-dark-subtle border-light-subtle rounded-full flex
             flex-col items-center justify-center dark:text-dark-subtle text-secondary
             cursor-pointer'
        >
          <AiOutlineCloudUpload size={80} />
          <p className='text-sm'>여기에 파일을 올리세요!</p>
        </div>
      </FileUploader>
    </div>
  );
};

const UploadProgress = ({ message, width, visible }) => {
  if (!visible) return null;

  return (
    <div className='p-2'>
      <div className='dark:bg-secondary bg-white drop-shadow-lg rounded p-3'>
        <div
          className='relative h-3 dark:bg-dark-subtile bg-light-subtle
          overflow-hidden'
        >
          <div
            style={{ width: width + '%' }}
            className='h-full absolute dark:bg-white bg-secondary'
          />
        </div>
        <p
          className='font-semibold dark:text-dark-subtle
              text-light-subtle animate-pulse mt-1'
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default MovieUpload;
