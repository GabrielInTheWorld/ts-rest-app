import { makeRequest, LOGIN_DATA } from './utils';
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

test('GET info', async () => {
  const { body, cookies } = await makeRequest(GET, 'info');
  expect(body).toBe('This is an info route');
  expect(cookies[0].value).toBe('hello_world');
});

test('POST secure/data', async () => {
  const { body } = await makeRequest(POST, 'secure/data', DATA);
  expect(body).toBe('Yeah, a secure data route!');
});

test('POST login', async () => {
  const loginData = { username: 'hello', password: 'world' };
  const { body } = await makeRequest(POST, 'login', loginData);
  expect(body).toBe(`${loginData.username}_${loginData.password}`);
});

test('GET promise', async () => {
  const { body } = await makeRequest(GET, 'promise');
  expect(body).toBe('A promise is resolved');
});

test('GET on-error', async () => {
  const { status } = await makeRequest(GET, 'on-error');
  expect(status).toBe(403);
});

test('GET on-deep-error', async () => {
  const { status } = await makeRequest(GET, 'on-deep-error');
  expect(status).toBe(403);
});

test('POST deep-promise', async () => {
  const { body } = await makeRequest(POST, 'deep-promise', LOGIN_DATA);
  expect(body.length).toBe(1);
  expect(body[0]).toBe('hello_world');
});
