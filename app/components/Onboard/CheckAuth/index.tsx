import Lock from "@/pages/Lock";
import { LoadingScreen } from "@/components/Custom/Loading";
import { useAuth } from "@/hooks/useAuth";

export const CheckAuth = (props: { children: React.ReactNode }) => {
  const { hasAuth, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hasAuth) {
    return <Lock />;
  }

  return <>{props.children}</>;
};
