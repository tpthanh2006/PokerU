type TokenSubscriber = (token: string | null) => void;

class TokenManager {
  private currentToken: string | null = null;
  private subscribers: TokenSubscriber[] = [];

  setToken(token: string | null, userId?: string) {
    this.currentToken = token;
    this.notifySubscribers();
  }

  getToken() {
    return this.currentToken;
  }

  subscribe(callback: TokenSubscriber) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentToken));
  }
}

export const tokenManager = new TokenManager(); 