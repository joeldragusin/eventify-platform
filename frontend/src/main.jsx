import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store.js";

import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/*Provider makes the store available for any component created (for any page from any feature and so on)*/}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
