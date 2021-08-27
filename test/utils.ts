import request from 'superagent';

export const PORT = 3000;
export const TEST_WORLD = 'test_world';

const agent = request.agent();

type HttpMethod = 'get' | 'post' | 'delete' | 'put';

export interface HttpData {
  [key: string]: any;
}

export interface HttpHeaders {
  [key: string]: string;
}

interface Cookie {
  key: string;
  value: string;
}

function formatUrl(path: string): string {
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  return `http://localhost:${PORT}/${path}`;
}

export async function makeRequest(
  method: HttpMethod,
  path: string = '/',
  data?: HttpData,
  headers: HttpHeaders = {}
): Promise<{ body: any; cookies: Cookie[] }> {
  const response = await agent[method](formatUrl(path))
    .set({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    })
    // .withCredentials()
    .send(data);
  const cookies = getCookies(response.header['set-cookie'] || []);
  return { body: response.body, cookies };
}

function getCookies(cookies: string[]): Cookie[] {
  const result: Cookie[] = [];
  for (const cookie of cookies) {
    const splitted = cookie.split('=');
    result.push({ key: splitted[0], value: splitted[1].split(';')[0] });
  }
  return result;
}
