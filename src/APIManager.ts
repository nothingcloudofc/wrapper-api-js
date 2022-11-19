import { APIResponse, RawUserData } from './typings';
import axios, { AxiosRequestConfig } from 'axios';

export class NothingCloudAPIError extends Error {
  constructor(code: string, message?: string) {
    super();

    this.name = 'NothingCloudAPIError';

    this.message =
      code
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/(^|\s)\S/g, (L) => L.toUpperCase()) +
      (message ? `: ${message}` : '');
  }
}

export class APIManager {
  constructor(private apiKey: string) {}

  private async fetch(path: string, options: AxiosRequestConfig = {}) {
    options.headers = {
      ...(options.headers || {}),
      Authorization: this.apiKey,
    };

    options.method = options.method || 'GET';

    const { data } = await axios(
      'https://api.nothingcloud.app/v1/public/' + path,
      options
    ).catch((r) => r.response);

    if (data.status === 'error') {
      throw new NothingCloudAPIError(data.code);
    }

    return data;
  }

  user(id?: string, options: AxiosRequestConfig = {}): Promise<RawUserData> {
    return this.fetch('user' + (id ? `/${id}` : ''), options).then(
      (e) => e.response
    );
  }

  application(
    path: string,
    id: string,
    options: AxiosRequestConfig | boolean = {}
  ): Promise<APIResponse> {
    return this.fetch(
      `${path}/${id}`,
      typeof options === 'boolean'
        ? options
          ? { method: 'POST' }
          : {}
        : options
    );
  }
}
