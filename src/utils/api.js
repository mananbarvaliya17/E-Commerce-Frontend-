export const parseJSONResponse = async (response) => {
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

  return data;
};

export const apiFetch = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Unable to reach server. Verify backend is running and API port is correct.');
  }

  return parseJSONResponse(response);
};
