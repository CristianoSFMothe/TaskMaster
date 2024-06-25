import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../components/header'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Header />
      <Component {...pageProps} />    
    </>
  

)
}
export default App
