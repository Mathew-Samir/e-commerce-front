import { HttpInterceptorFn } from '@angular/common/http';
import { STORAGE_KEYS } from '../constants/storage.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  let clonedRequest = req.clone({
    withCredentials: true,
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedRequest);
};
