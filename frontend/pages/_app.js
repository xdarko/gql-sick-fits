/**
 * Custom root component that wraps all the pages
 * and extends default <App/> provided by next.js
 * https://github.com/zeit/next.js/#custom-app
 *
 * Connection to apollo client is achieved via 'withData' HOC
 */

import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';
import Layout from '../components/Layout';

class MyApp extends App {
  /**
   * Await's to get initial props of the current page component
   * (initial queries, mutations, etc.), before we can actually render this page.
   * Then passes those props (+ special 'query' context prop) down to page component.  
   */
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // expose the url query params to every page component via props:
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    // Current page component is available in props:
    const { Component, apollo, pageProps } = this.props;
    
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(MyApp);
