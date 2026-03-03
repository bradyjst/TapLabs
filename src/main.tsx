import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TapLabApp from "./app/TapLabApp";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Membership from "./pages/Membership";
import Profile from "./pages/Profile";
import HowToUse from "./pages/HowToUse";
import Feedback from "./pages/Feedback";
import Collaborators from "./pages/Collaborators";
import Resources from "./pages/Resources";
import Layout from "./layout/Layout";
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
						<Route path="/profile" element={<Profile />} />
						<Route path="/how-to-use" element={<HowToUse />} />
						<Route path="/collaborators" element={<Collaborators />} />
						<Route path="/resources" element={<Resources />} />
						<Route path="/feedback" element={<Feedback />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</React.StrictMode>,
);
