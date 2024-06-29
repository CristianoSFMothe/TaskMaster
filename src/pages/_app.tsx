import "../../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../components/header";
import { SessionProvider } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
      <ToastContainer />
    </SessionProvider>
  );
};
export default App;
