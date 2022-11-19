import { APIManager, NothingCloudAPIError } from './APIManager';
import { Application } from './structures/Application';
import { FullUser, User } from './structures/User';
import { validateString } from './Assertions';

export class NothingCloudAPI {
  static apiInfo = {
    version: 'v1',
    baseUrl: 'https://api.nothingcloud.app/v1/public/',
  };

  public readonly apiManager: APIManager;

  /**
   * Creates an API instance
   *
   * @param apiKey - Your API Token (you can get it at [NothingCloud Dashboard](https://nothingcloud.app/dashboard))
   */
  constructor(apiKey: string) {
    validateString(apiKey, 'API_KEY');

    this.apiManager = new APIManager(apiKey);
  }

  /**
   * Gets a user's informations
   *
   * @param userId - The user id, if not provided it will get your own information
   */
  async getUser(): Promise<FullUser>;
  async getUser(userId: string): Promise<User>;
  async getUser(userId?: string): Promise<User> {
    if (userId) validateString(userId, 'USER_ID');

    const userData = await this.apiManager.user(userId);
    const hasAccess = userData.user.email !== 'Access denied';

    return new (hasAccess ? FullUser : User)(this.apiManager, userData);
  }

  /**
   * Returns an application that you can manage or get information
   *
   * @param appId - The application id, you must own the application
   */
  async getApplication(appId: string): Promise<Application> {
    validateString(appId, 'APP_ID');

    const { applications } = await this.apiManager.user();
    const appData = applications.find((app) => app.id === appId);

    if (!appData) {
      throw new NothingCloudAPIError('APP_NOT_FOUND');
    }

    return new Application(this.apiManager, appData);
  }
}
