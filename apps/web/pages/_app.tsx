import { AppProps } from "next/app";

import Head from "next/head";

import "./styles.css";

const CustomApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Quicksend</title>
      </Head>

      <div className="app">
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
};

export default CustomApp;
