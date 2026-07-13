const QUOTED_VALUE_KEYS = new Set([
  'ServerName',
  'ServerDescription',
  'ServerPassword',
  'AdminPassword',
  'Region',
  'PublicIP',
]);

function stripOuterParens(input) {
  const trimmed = input.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function splitOptionPairs(content) {
  const pairs = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const prev = content[i - 1];

    if (char === '"' && prev !== '\\') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if (!inQuotes) {
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      } else if (char === ',' && depth === 0) {
        if (current.trim()) {
          pairs.push(current.trim());
        }
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    pairs.push(current.trim());
  }

  return pairs;
}

function parseValue(raw) {
  const value = raw.trim();
  if (!value) {
    return '';
  }

  if (value.startsWith('"')) {
    if (value.endsWith('"') && value.length >= 2) {
      return value.slice(1, -1);
    }
    return value.slice(1);
  }

  if (value.startsWith('(')) {
    return value;
  }

  if (value === 'True') {
    return true;
  }
  if (value === 'False') {
    return false;
  }

  const num = Number(value);
  if (!Number.isNaN(num) && value !== '') {
    return num;
  }

  return value;
}

function formatValue(key, value) {
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  const str = String(value);

  if (str.startsWith('(') && str.endsWith(')')) {
    return str;
  }

  if (str.startsWith('"') && str.endsWith('"')) {
    return str;
  }

  if (QUOTED_VALUE_KEYS.has(key) || str.includes(',') || str.includes(' ')) {
    return `"${str.replace(/"/g, '')}"`;
  }

  return str;
}

const palServerSettingConverter = {
  parse(input) {
    if (!input) {
      return {};
    }

    const content = stripOuterParens(input);
    const result = {};

    splitOptionPairs(content).forEach((pair) => {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) {
        return;
      }

      const key = pair.slice(0, eqIndex).trim();
      const rawValue = pair.slice(eqIndex + 1);
      result[key] = parseValue(rawValue);
    });

    return result;
  },
  format(inputJson) {
    if (!inputJson) {
      return '()';
    }

    const entries = Object.entries(inputJson);
    const formattedPairs = entries.map(([key, value]) => {
      return `${key}=${formatValue(key, value)}`;
    });

    return `(${formattedPairs.join(',')})`;
  },
};

export default palServerSettingConverter;
