/* eslint-disable no-undef */
import axios from 'axios';
import * as yup from 'yup';
import watchedState from './watchers.js';
import parser from './parser.js';

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

const watcher = watchedState(state);

const schema = yup.string().url();

const validate = (url) => {
  schema.validateSync(url);
};

const addPosts = (doc) => {
  const items = doc.querySelectorAll('item');
  let posts = [];

  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    // const { posts } = state;
    const post = { title, description, link };

    posts = [...posts, post];
  });
  watcher.posts = [...posts];
};

const addFeeds = (doc) => {
  let feeds = [];

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

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
    validate(url);

    watcher.form = { ...watcher.form, valid: true };
    watcher.downloadProcess = { ...watcher.downloadProcess, status: 'processing' };

    getStream(url)
      .then((res) => parser(res.data.contents))
      .then((doc) => {
        addFeeds(doc);
        addPosts(doc);
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
      })
      .catch((err) => {
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: err };
      });
  } catch (err) {
    watcher.form = { ...watcher.form, processState: 'error', error: err.message };
  }
});
