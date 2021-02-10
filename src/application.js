/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
import axios from 'axios';
import * as yup from 'yup';
import watchedState from './watchers.js';
import parser from './parser.js';

const button = document.querySelector('.btn');
const feedback = document.querySelector('.feedback');
const input = document.querySelector('input');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const domElements = {
  button,
  input,
  feeds,
  feedback,
  posts,
};

const app = () => {
  const form = document.querySelector('form');

  const state = {
    form: {
      processState: 'filling',
      valid: false,
      error: null,
    },
    // processState: 'filling',
    posts: [],
    feeds: [],
    downloadProcess: { status: 'filling', error: null },
  };

  const watcher = watchedState(state, domElements);

  const schema = yup.string().url();

  const validate = (url) => {
    try {
      schema.validateSync(url);
      return null;
    } catch (err) {
      return err;
    }
  };

  const addPosts = ({ items }) => {
    let posts = [];

    items.forEach(({ title, description, link }) => {
      const post = { title, description, link };

      posts = [...posts, post];
    });
    watcher.posts = [...posts];
  };

  const addFeeds = ({ title, description }) => {
    let feeds = [];
    const feed = { title, description };

    feeds = [...feeds, feed];
    watcher.feeds = [...feeds];
  };

  const getStream = (url) => axios(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');

    try {
      const getValidError = validate(url);

      if (getValidError) {
        watcher.form = { ...watcher.form, processState: 'error', error: getValidError.message };
      } else {
        watcher.form = { ...watcher.form, valid: true };
      }

      watcher.downloadProcess = { ...watcher.downloadProcess, status: 'processing' };

      getStream(url)
        .then((res) => {
          const parserData = parser(res.data.contents);
          addFeeds(parserData);
          addPosts(parserData);
          watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
        });
    } catch (err) {
      watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: err };
    }
  });
};

export default app;
