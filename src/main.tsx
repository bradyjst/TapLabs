import React from "react";
import ReactDOM from "react-dom/client";
import TapLabApp from "./app/TapLabApp";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<TapLabApp />
		</AuthProvider>
	</React.StrictMode>,
);
