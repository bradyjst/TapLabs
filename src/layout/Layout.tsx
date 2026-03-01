import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import { useTheme } from "../theme/useTheme";

export default function Layout() {
	useTheme();
	return (
		<>
			<Outlet />
			<Footer />
		</>
	);
}
