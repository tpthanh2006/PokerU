import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href="/(home)/(tabs)/HomePage" />;

  return <Redirect href="/(auth)/OnboardingScreen" />;
}
export default Page;