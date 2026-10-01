import { startLoading, stopLoading } from './console';

export async function post(action, data) {
  startLoading();
  try {
    const response = await fetch('./sql.php', {
      method: 'POST',
      body: new URLSearchParams({ action, ...data }),
    });
    return await response.text();
  } catch (error) {
    return error.message;
  } finally {
    stopLoading();
  }
}
