import React from 'react';
import TagsInput from './TagsInput';

const commInputClasses =
  'w-full bg-transparent outline-none dark:border-dark-subtle border-light-subtle dark:focus:border-white focus:border-primary transition dark:text-white text-primary';

const MovieForm = () => {
  return (
    <form className='flex space-x-3'>
      <div className='w-[70%] h-5 space-y-5'>
        <div>
          <Label htmlFor='title'>제목</Label>
          <input
            id='title'
            type='text'
            className={commInputClasses + ' border-b-2 font-semibold  text-xl'}
            placeholder='타이타닉'
          />
        </div>

        <div>
          <Label htmlFor='storyLine'>줄거리</Label>
          <textarea
            id='storyLine'
            className={commInputClasses + ' border-b-2 resize-none h-24 '}
            placeholder='영화 줄거리..'
          ></textarea>
        </div>

        <TagsInput />
      </div>
      <div className='w-[30%] h-5'></div>
    </form>
  );
};

const Label = ({ children, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className='dark:text-dark-subtle
  text-light-subtle font-semibold'
    >
      {children}
    </label>
  );
};

export default MovieForm;
