import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const TagsInput = () => {
  return (
    <div>
      <div
        className='border-2 bg-transparent dark:border-dark-subtle
    border-light-subtle px-2 h-10 rounded w-full text-white
    flex items-center space-x-2'
      >
        <Tag>Tag two</Tag>
        <Tag>Tag three</Tag>
        <input
          type='text'
          className='h-full flex-grow bg-transparent outline-none
          dark:text-white text-light-subtle'
          placeholder='Tag one, Tag two'
        />
      </div>
    </div>
  );
};

export default TagsInput;

const Tag = ({ children, onClick }) => {
  return (
    <span
      className='dark:bg-white bg-primary dark:text-primary
  text-white flex items-center text-sm px-1'
    >
      {children}
      <button onClick={onClick}>
        <AiOutlineClose size={12} />
      </button>
    </span>
  );
};
