import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TapLabApp from "./app/TapLabApp";
import About from "../src/pages/About";
import Terms from "../src/pages/Terms";
import Privacy from "../src/pages/Privacy";
import Membership from "../src/pages/Membership";
import Layout from "../src/layout/Layout";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<TapLabApp />} />
						<Route path="/about" element={<About />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/membership" element={<Membership />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</React.StrictMode>,
);
