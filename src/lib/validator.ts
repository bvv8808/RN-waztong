export const validPhoneFormat = (num: string): string => {
  if (num.length !== 11) return '- 을 제외한 11자리 숫자를 입력해 주세요';
  for (const c of num) {
    if (c >= '0' && c <= '9') continue;
    else {
      return '- 을 제외한 숫자만 입력해 주세요';
    }
  }
  return 'pass';
};

export const validEmail = (email: string) => {
  const s1 = email.split('@');
  if (s1.length === 1 || s1[1].startsWith('.') || s1[1].endsWith('.'))
    return 'Invalid Email Format';

  const s2 = s1[1].split('.');
  if (s2.length === 1) return 'Invalid Email Format';

  if (email.indexOf(',') !== -1 || email.indexOf('..') !== -1)
    return 'Invalid Email Format';

  return 'pass';
};

export const validPassword = (pw: string) => {
  if (pw.length < 6) return 'too short';
  let arr = [0, 0];
  for (const c of pw) {
    if (c >= '0' && c <= '9') arr[0]++;
    else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) arr[1]++;
  }
  if (arr[0] === 0 || arr[1] === 0) return 'invalid';

  return 'pass';
};
