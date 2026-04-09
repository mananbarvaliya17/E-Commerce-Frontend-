const getCookieValue = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
};

const parseJSONResponse = async (response) => {
  const rawText = await response.text();

  let data = {};
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      if (!response.ok) {
        throw new Error(
          `Server returned a non-JSON response (${response.status}). Check API URL, route, and backend status.`
        );
      }
      throw new Error('Received invalid JSON response from server.');
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  if (data && typeof data === 'object' && data.success === true && data.data && typeof data.data === 'object') {
    return { ...data, ...data.data };
  }

  return data;
};

const ensureCsrfToken = async (origin) => {
  const existingToken = getCookieValue('csrfToken');
  if (existingToken) {
    return existingToken;
  }

  const csrfResponse = await fetch(`${origin}/api/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
  });

  const csrfData = await parseJSONResponse(csrfResponse);
  return csrfData?.csrfToken || getCookieValue('csrfToken');
};

const resolveRequestOrigin = (url) => {
  try {
    return new URL(url, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const apiFetch = async (url, options = {}) => {
  let response;
  try {
    const method = String(options.method || 'GET').toUpperCase();
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    const headers = new Headers(options.headers || {});

    if (!safeMethods.includes(method)) {
      const csrfToken = await ensureCsrfToken(resolveRequestOrigin(url));
      if (csrfToken && !headers.has('X-CSRF-Token')) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }

    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Unable to reach server. Verify backend is running and API port is correct.');
  }

  return parseJSONResponse(response);
};
