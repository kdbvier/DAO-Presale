import React from "react"
import { render } from "react-dom"
import App from "containers/App"
import reportWebVitals from "./reportWebVitals"
import "styles/style.scss"
import { DAppProvider } from "@usedapp/core";
render(
  <React.StrictMode>
    <DAppProvider config={{}}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
