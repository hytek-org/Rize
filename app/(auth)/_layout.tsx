
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthProvider";
import { Redirect, Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";



const AuthLayout = () => {
  const { loading, isLogged } = useAuth();

  if (!loading && isLogged) return <Redirect href="/" />;

  return (
    <>
    <Slot/>
      {/* <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgot"
          options={{
            headerShown: true,
            title:"Forgot Password"
          }}
        />
      </Stack>

      <Loader isLoading={loading} />
      <StatusBar backgroundColor="#161622" style="light" /> */}
    </>
  );
};

export default AuthLayout;
