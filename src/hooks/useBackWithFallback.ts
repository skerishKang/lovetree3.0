import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const navigationKeys: string[] = [];

export function pushNavigationKey(key: string) {
  if (navigationKeys.length === 0 || navigationKeys[navigationKeys.length - 1] !== key) {
    navigationKeys.push(key);
  }
}

export function canGoBack(): boolean {
  return navigationKeys.length > 1;
}

export function clearNavigationHistory() {
  navigationKeys.length = 0;
}

export function useBackWithFallback(fallbackPath: string) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    pushNavigationKey(location.key);
  }, [location.key]);

  const goBack = () => {
    if (canGoBack()) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return goBack;
}
