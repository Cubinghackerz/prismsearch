interface BreachData {
  password: string;
  isBreached: boolean;
  breachCount: number;
  lastChecked: string;
}

class BreachDetectionService {
  private static readonly BREACH_CACHE_KEY = 'prism_vault_breach_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Simulate breach detection using comprehensive password patterns
  static async checkPasswordBreach(password: string): Promise<BreachData> {
    const cache = this.getCache();
    const cached = cache[password];
    
    // Return cached result if recent
    if (cached && Date.now() - new Date(cached.lastChecked).getTime() < this.CACHE_DURATION) {
      return cached;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Comprehensive breach detection
    const isBreached = this.isBreachedPassword(password);
    const breachCount = isBreached ? this.calculateBreachCount(password) : 0;

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

  private static isBreachedPassword(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    
    // Check against comprehensive common passwords list
    if (this.isCommonPassword(lowerPassword)) return true;
    
    // Check for simple patterns
    if (this.isSimplePattern(password)) return true;
    
    // Check for keyboard patterns
    if (this.isKeyboardPattern(lowerPassword)) return true;
    
    // Check for date patterns
    if (this.isDatePattern(password)) return true;
    
    // Check for weak numeric patterns
    if (this.isWeakNumericPattern(password)) return true;
    
    return false;
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      // Top breached passwords
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      '12345678', '111111', '1234567890', 'password1', 'iloveyou', 'princess',
      'rockyou', 'nicole', 'daniel', 'babygirl', 'monkey', 'jessica',
      'lovely', 'michael', 'ashley', 'football', 'michelle', 'robert',
      'jennifer', 'joshua', 'hunter', 'jordan', 'andrew', 'amanda',
      'welcome', 'sunshine', 'shadow', 'matrix', 'master', 'hello',
      'freedom', 'whatever', 'trustno1', 'batman', 'zaq1zaq1', 'superman',
      'passw0rd', 'letmein', 'admin', 'dragon', 'mustang', 'soccer',
      'purple', 'orange', 'yellow', 'starwars', 'summer', 'winter',
      
      // Simple numeric sequences
      '12345', '123456', '1234567', '12345678', '123456789', '1234567890',
      '0123456789', '987654321', '11111', '111111', '1111111', '11111111',
      '22222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
      '000000', '101010', '121212', '123123', '234234', '345345', '456456',
      
      // Simple letter sequences
      'abcdef', 'abcdefg', 'abcdefgh', 'abcdefghi', 'qwertyui', 'qwertyuio',
      'asdfgh', 'asdfghj', 'asdfghjk', 'zxcvbn', 'zxcvbnm',
      
      // Common words with numbers
      'password1', 'password12', 'password123', 'admin123', 'user123',
      'test123', 'welcome123', 'hello123', 'login123', 'pass123',
      '123password', '123admin', '123user', '123test',
      
      // Years and dates
      '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016',
      '2015', '2014', '2013', '2012', '2011', '2010', '1999', '2000',
      
      // Sports and teams
      'football', 'baseball', 'basketball', 'soccer', 'hockey', 'tennis',
      'golf', 'swimming', 'running', 'yankees', 'lakers', 'cowboys',
      
      // Animals
      'dog', 'cat', 'bird', 'fish', 'horse', 'tiger', 'lion', 'bear',
      'elephant', 'monkey', 'rabbit', 'chicken', 'puppy', 'kitty',
      
      // Colors
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'silver', 'gold',
      
      // Names (common first names)
      'john', 'mary', 'david', 'sarah', 'mike', 'lisa', 'chris', 'amy',
      'mark', 'anna', 'paul', 'karen', 'steve', 'linda', 'tom', 'susan'
    ];

    return commonPasswords.some(common => 
      password.includes(common) || common.includes(password)
    );
  }

  private static isSimplePattern(password: string): boolean {
    // Check for repeated characters
    if (/^(.)\1{2,}$/.test(password)) return true; // aaa, 111, etc.
    
    // Check for simple alternating patterns
    if (/^(..)\1{2,}$/.test(password)) return true; // abab, 1212, etc.
    
    // Check for simple incremental patterns
    if (/^(012|123|234|345|456|567|678|789|890)+$/.test(password)) return true;
    if (/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i.test(password)) return true;
    
    return false;
  }

  private static isKeyboardPattern(password: string): boolean {
    const keyboardPatterns = [
      'qwerty', 'qwertyui', 'qwertyuio', 'qwertyuiop',
      'asdf', 'asdfg', 'asdfgh', 'asdfghj', 'asdfghjk', 'asdfghjkl',
      'zxcv', 'zxcvb', 'zxcvbn', 'zxcvbnm',
      '1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik', '9ol', '0p',
      'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb', 'tgbyhn', 'yhnujm',
      '1q2w3e', '2w3e4r', '3e4r5t', '4r5t6y', '5t6y7u', '6y7u8i', '7u8i9o', '8i9o0p'
    ];

    return keyboardPatterns.some(pattern => 
      password.includes(pattern) || pattern.includes(password)
    );
  }

  private static isDatePattern(password: string): boolean {
    // Check for common date formats
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YY or MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/, // MM-DD-YY or MM-DD-YYYY
      /^\d{4}\d{2}\d{2}$/, // YYYYMMDD
      /^\d{2}\d{2}\d{4}$/, // MMDDYYYY
      /^(19|20)\d{2}$/, // Years 1900-2099
      /^(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/ // MMDD
    ];

    return datePatterns.some(pattern => pattern.test(password));
  }

  private static isWeakNumericPattern(password: string): boolean {
    // All numbers
    if (/^\d+$/.test(password)) {
      // Check for simple patterns in numbers
      if (password.length <= 6) return true; // Short numeric passwords
      if (/^(\d)\1+$/.test(password)) return true; // All same digit
      if (this.isSequentialNumbers(password)) return true;
    }
    
    return false;
  }

  private static isSequentialNumbers(password: string): boolean {
    const digits = password.split('').map(Number);
    
    // Check ascending sequence
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i-1] + 1) break;
      if (i === digits.length - 1) return true;
    }
    
    // Check descending sequence
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i-1] - 1) break;
      if (i === digits.length - 1) return true;
    }
    
    return false;
  }

  private static calculateBreachCount(password: string): number {
    const lowerPassword = password.toLowerCase();
    
    // Very common passwords get higher breach counts
    const veryCommon = ['password', '123456', '123456789', 'qwerty', 'abc123'];
    if (veryCommon.some(p => lowerPassword.includes(p))) {
      return Math.floor(Math.random() * 10000000) + 5000000; // 5M-15M
    }
    
    // Common passwords get medium breach counts
    if (this.isCommonPassword(lowerPassword)) {
      return Math.floor(Math.random() * 5000000) + 1000000; // 1M-6M
    }
    
    // Simple patterns get lower but still significant counts
    if (this.isSimplePattern(password) || this.isKeyboardPattern(lowerPassword)) {
      return Math.floor(Math.random() * 1000000) + 100000; // 100K-1.1M
    }
    
    // Other breached passwords
    return Math.floor(Math.random() * 100000) + 10000; // 10K-110K
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
