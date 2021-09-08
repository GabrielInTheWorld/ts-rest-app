import request from 'superagent';
const agent = request.agent();

export const PORT = 3000;
export const TEST_WORLD = 'test_world';

export const LOGIN_DATA: LoginData = { username: 'hello', password: 'world' };
export interface LoginData {
  username: string;
  password: string;
}

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
): Promise<{ body: any; cookies: Cookie[]; status: number }> {
  try {
    const response = await agent[method](formatUrl(path))
      .set({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers
      })
      .send(data);
    const cookies = getCookies(response.header['set-cookie'] || []);
    return { body: response.body, cookies, status: response.status };
  } catch (e: any) {
    return { body: e.message, status: e.status, cookies: [] };
  }
}

function getCookies(cookies: string[]): Cookie[] {
  const result: Cookie[] = [];
  for (const cookie of cookies) {
    const splitted = cookie.split('=');
    result.push({ key: splitted[0], value: splitted[1].split(';')[0] });
  }
  return result;
}
