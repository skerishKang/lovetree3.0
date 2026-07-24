import { useNavigate } from "react-router-dom";
import { useNavigationHistory } from "./NavigationHistory";

export function useBackWithFallback(fallbackPath: string) {
  const navigate = useNavigate();
  const { canGoBack } = useNavigationHistory();

  return () => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };
}
