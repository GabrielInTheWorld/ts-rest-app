import { makeRequest } from './utils';
import { GET, POST } from '../src/util/constants';

const DATA = { message: 'true' };

test('GET index', async () => {
  const { body } = await makeRequest(GET);
  expect(body).toBe('Hello World!');
});

test('POST data', async () => {
  const { body } = await makeRequest(POST, 'data', DATA);
  expect(body).toBe(DATA.message);
});

test('GET cookies', async () => {
  const { body, cookies } = await makeRequest(GET, 'info');
  expect(body).toBe('This is an info route');
  expect(cookies[0].value).toBe('hello_world');
});

test('POST secure/data', async () => {
  const { body } = await makeRequest(POST, 'secure/data', DATA);
  expect(body).toBe('Yeah, a secure data route!');
});
