// Holds the access token in memory only.
// Never persisted to localStorage/sessionStorage — protects against XSS token theft.
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
