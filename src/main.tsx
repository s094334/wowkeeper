import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 後端有回應（404 找不到、401 沒權限…）就別重試——再試幾次答案還是一樣，
        // 只會讓錯誤訊息晚好幾秒才出現。只有連不上（斷網、逾時）才值得重試。
        if (axios.isAxiosError(error) && error.response) return false;
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
