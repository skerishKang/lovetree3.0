import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  NavigationType,
  useLocation,
  useNavigationType,
} from "react-router-dom";

interface NavigationHistory {
  canGoBack: boolean;
}

const NavigationHistoryContext = createContext<NavigationHistory>({
  canGoBack: false,
});

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const stackRef = useRef<string[]>([]);
  const seededRef = useRef(false);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    let stack = stackRef.current;

    if (!seededRef.current) {
      stack = [location.key];
      seededRef.current = true;
    } else if (navigationType === NavigationType.Push) {
      if (stack[stack.length - 1] !== location.key) {
        stack = [...stack, location.key];
      }
    } else if (navigationType === NavigationType.Replace) {
      stack =
        stack.length > 0
          ? [...stack.slice(0, -1), location.key]
          : [location.key];
    } else if (navigationType === NavigationType.Pop) {
      const idx = stack.indexOf(location.key);
      stack = idx >= 0 ? stack.slice(0, idx + 1) : [...stack, location.key];
    }

    stackRef.current = stack;
    setCanGoBack(stack.length > 1);
  }, [location.key, navigationType]);

  const value = useMemo(() => ({ canGoBack }), [canGoBack]);

  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory(): NavigationHistory {
  return useContext(NavigationHistoryContext);
}
