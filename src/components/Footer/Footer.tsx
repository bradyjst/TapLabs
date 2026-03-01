import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="footer-inner">
				<div className="footer-brand">
					<span className="footer-logo">TapLabs</span>
				</div>

				<nav className="footer-links">
					<Link to="/about">About</Link>
					<Link to="/terms">Terms of Service</Link>
					<Link to="/privacy">Privacy Policy</Link>
					<Link to="/membership">Membership</Link>
				</nav>

				<div className="footer-copy">
					&copy; {new Date().getFullYear()} TapLabs. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
