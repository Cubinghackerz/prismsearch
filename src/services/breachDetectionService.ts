
interface BreachData {
  password: string;
  isBreached: boolean;
  breachCount: number;
  lastChecked: string;
}

class BreachDetectionService {
  private static readonly BREACH_CACHE_KEY = 'prism_vault_breach_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Simulate breach detection using common password patterns
  static async checkPasswordBreach(password: string): Promise<BreachData> {
    const cache = this.getCache();
    const cached = cache[password];
    
    // Return cached result if recent
    if (cached && Date.now() - new Date(cached.lastChecked).getTime() < this.CACHE_DURATION) {
      return cached;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple breach detection based on common patterns
    const isBreached = this.isCommonPassword(password);
    const breachCount = isBreached ? Math.floor(Math.random() * 1000000) + 1000 : 0;

    const result: BreachData = {
      password,
      isBreached,
      breachCount,
      lastChecked: new Date().toISOString()
    };

    // Cache the result
    cache[password] = result;
    this.saveCache(cache);

    return result;
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
      'iloveyou', 'princess', 'rockyou', '12345678', 'abc123', 'nicole',
      'daniel', 'babygirl', 'monkey', 'jessica', 'lovely', 'michael',
      'ashley', 'football', 'michelle', 'robert', 'jennifer', 'joshua'
    ];

    return commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
  }

  private static getCache(): Record<string, BreachData> {
    const cache = localStorage.getItem(this.BREACH_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  }

  private static saveCache(cache: Record<string, BreachData>): void {
    localStorage.setItem(this.BREACH_CACHE_KEY, JSON.stringify(cache));
  }

  static clearCache(): void {
    localStorage.removeItem(this.BREACH_CACHE_KEY);
  }
}

export default BreachDetectionService;
